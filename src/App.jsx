import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'

function App() {
  const [transactions, setTransactions] = useState([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('income')
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState('')
  const [activeTab, setActiveTab] = useState('me') // 'me' ou 'her'
  const [userName, setUserName] = useState('me') // 'me' ou 'her'

  // Carregar dados do Firestore em tempo real
  useEffect(() => {
    const transactionsRef = collection(db, 'transactions')
    const unsubscribe = onSnapshot(transactionsRef, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Ordenar por data (mais recente primeiro)
      transactionsData.sort((a, b) => {
        const dateA = new Date(a.date || 0)
        const dateB = new Date(b.date || 0)
        return dateB - dateA
      })
      setTransactions(transactionsData)
    })

    // Carregar renda mensal
    const incomeRef = doc(db, 'settings', 'monthlyIncome')
    getDoc(incomeRef).then((docSnap) => {
      if (docSnap.exists()) {
        const income = docSnap.data().value
        setMonthlyIncome(income)
        setMonthlyIncomeInput(income.toString())
      }
    })

    return () => unsubscribe()
  }, [])

  // Filtrar transações por aba ativa
  const filteredTransactions = activeTab === 'all' 
    ? transactions 
    : transactions.filter(t => t.owner === activeTab)
  
  // Calcular saldo total (apenas da aba ativa)
  const balance = filteredTransactions.reduce((total, transaction) => {
    return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
  }, 0)

  // Calcular total de receitas (apenas da aba ativa)
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)

  // Calcular total de despesas (apenas da aba ativa)
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)
  
  // Calcular totais gerais (ambos)
  const allTransactions = transactions
  const totalBalance = allTransactions.reduce((total, transaction) => {
    return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
  }, 0)

  // Definir renda mensal esperada
  const handleSetMonthlyIncome = async (e) => {
    e.preventDefault()
    const income = parseFloat(monthlyIncomeInput)
    if (income > 0) {
      try {
        const incomeRef = doc(db, 'settings', 'monthlyIncome')
        await setDoc(incomeRef, { value: income })
        setMonthlyIncome(income)
        alert('Renda mensal definida com sucesso!')
      } catch (error) {
        console.error('Erro ao salvar renda mensal:', error)
        alert('Erro ao salvar. Verifique se o Firebase está configurado.')
      }
    } else {
      alert('Por favor, insira um valor válido!')
    }
  }

  // Resetar o mês (apenas da aba ativa)
  const resetMonth = async () => {
    const tabName = activeTab === 'me' ? 'seus' : 'dela'
    if (window.confirm(`Tem certeza que deseja resetar o mês? Todas as transações ${tabName} serão excluídas!`)) {
      try {
        // Deletar apenas transações da aba ativa
        const transactionsToDelete = transactions.filter(t => t.owner === activeTab)
        const deletePromises = transactionsToDelete.map(transaction => 
          deleteDoc(doc(db, 'transactions', transaction.id))
        )
        await Promise.all(deletePromises)
        alert('Mês resetado com sucesso!')
      } catch (error) {
        console.error('Erro ao resetar:', error)
        alert('Erro ao resetar. Tente novamente.')
      }
    }
  }

  // Adicionar nova transação
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Por favor, preencha todos os campos corretamente!')
      return
    }

    try {
      const newTransaction = {
        description: description.trim(),
        amount: parseFloat(amount),
        type: type,
        owner: userName, // Adiciona o dono da transação
        date: new Date().toISOString(),
        dateFormatted: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      await addDoc(collection(db, 'transactions'), newTransaction)
      setDescription('')
      setAmount('')
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
      alert('Erro ao adicionar transação. Verifique se o Firebase está configurado.')
    }
  }

  // Deletar transação
  const deleteTransaction = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteDoc(doc(db, 'transactions', id))
      } catch (error) {
        console.error('Erro ao deletar transação:', error)
        alert('Erro ao deletar transação. Tente novamente.')
      }
    }
  }

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="app">
      <h1>💰 Controle de Finanças</h1>

      {/* Abas para alternar entre Meus Dados e Dados Dela */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'me' ? 'active' : ''}`}
          onClick={() => setActiveTab('me')}
        >
          👤 Meus Dados
        </button>
        <button 
          className={`tab ${activeTab === 'her' ? 'active' : ''}`}
          onClick={() => setActiveTab('her')}
        >
          💕 Dados Dela
        </button>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📊 Todos Juntos
        </button>
      </div>

      {/* Selecionar quem está adicionando */}
      <div className="user-selector">
        <label>Adicionar transação como:</label>
        <select value={userName} onChange={(e) => setUserName(e.target.value)}>
          <option value="me">👤 Eu</option>
          <option value="her">💕 Ela</option>
        </select>
      </div>

      <div className="balance">
        <h2>Saldo {activeTab === 'me' ? 'Meu' : activeTab === 'her' ? 'Dela' : 'Total'}</h2>
        <div className="amount">{formatCurrency(activeTab === 'all' ? totalBalance : balance)}</div>
      </div>

      <div className="income-section">
        <h3>📊 Renda Mensal</h3>
        <div className="income-info">
          <div className="income-item">
            <span className="income-label">Renda Esperada:</span>
            <span className="income-value">{formatCurrency(monthlyIncome)}</span>
          </div>
          <div className="income-item">
            <span className="income-label">Já Recebido:</span>
            <span className="income-value income-received">{formatCurrency(totalIncome)}</span>
          </div>
          {monthlyIncome > 0 && (
            <div className="income-item">
              <span className="income-label">Falta Receber:</span>
              <span className="income-value income-remaining">
                {formatCurrency(Math.max(0, monthlyIncome - totalIncome))}
              </span>
            </div>
          )}
        </div>
        <form onSubmit={handleSetMonthlyIncome} className="income-form">
          <div className="form-group">
            <label>Definir Renda Mensal Esperada (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={monthlyIncomeInput}
              onChange={(e) => setMonthlyIncomeInput(e.target.value)}
              placeholder="Ex: 5000.00"
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Definir Renda Mensal
          </button>
        </form>
        <button onClick={resetMonth} className="btn btn-danger">
          🔄 Resetar Mês
        </button>
      </div>

      <div className="form-section">
        <h3>Nova Transação</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salário, Almoço, Conta de luz..."
            />
          </div>

          <div className="form-group">
            <label>Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="income">💰 Entrada (Receita)</option>
              <option value="expense">💸 Saída (Despesa)</option>
            </select>
          </div>

          <button type="submit" className="btn">
            Adicionar Transação
          </button>
        </form>
      </div>

      <div className="transactions">
        <h3>Histórico de Transações {activeTab === 'me' ? '(Minhas)' : activeTab === 'her' ? '(Delas)' : '(Todos)'}</h3>
        {(activeTab === 'all' ? transactions : filteredTransactions).length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma transação ainda. Adicione sua primeira transação acima! 📝</p>
          </div>
        ) : (
          <div className="transaction-list">
            {(activeTab === 'all' ? transactions : filteredTransactions).map(transaction => (
              <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                <div className="transaction-info">
                  <div className="description">
                    {transaction.description}
                    {activeTab === 'all' && (
                      <span className="owner-badge">
                        {transaction.owner === 'me' ? ' 👤' : ' 💕'}
                      </span>
                    )}
                  </div>
                  <div className="date">{transaction.dateFormatted || transaction.date}</div>
                </div>
                <div className="transaction-amount">
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteTransaction(transaction.id)}
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

