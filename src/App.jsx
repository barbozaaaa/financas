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
  const [userName, setUserName] = useState(activeTab) // 'me' ou 'her' - sempre igual à aba ativa

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
  const filteredTransactions = transactions.filter(t => t.owner === activeTab)
  
  // Calcular saldo total (apenas transações, renda mensal já está incluída como transação)
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

  // Definir renda mensal esperada e adicionar automaticamente ao saldo
  const handleSetMonthlyIncome = async (e) => {
    e.preventDefault()
    const income = parseFloat(monthlyIncomeInput)
    if (income > 0) {
      try {
        const incomeRef = doc(db, 'settings', 'monthlyIncome')
        await setDoc(incomeRef, { value: income })
        
        // Verificar se já existe uma transação de "Renda Mensal" deste mês
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const existingIncome = transactions.find(t => 
          t.owner === 'me' && 
          t.description === 'Renda Mensal' &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
        )
        
        if (!existingIncome) {
          // Adicionar automaticamente como transação de renda
          const incomeTransaction = {
            description: 'Renda Mensal',
            amount: income,
            type: 'income',
            owner: 'me', // Sempre adiciona como "me"
            date: new Date().toISOString(),
            dateFormatted: new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
          await addDoc(collection(db, 'transactions'), incomeTransaction)
        } else {
          // Atualizar a transação existente
          await setDoc(doc(db, 'transactions', existingIncome.id), {
            ...existingIncome,
            amount: income
          })
        }
        
        setMonthlyIncome(income)
        alert('Renda mensal definida e adicionada ao saldo com sucesso!')
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

  // Atualizar userName quando mudar a aba
  useEffect(() => {
    setUserName(activeTab)
  }, [activeTab])

  return (
    <div className="app">
      <h1>💰 Controle de Finanças</h1>
      <p className="month-label">Novembro</p>

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
      </div>

      <div className="balance">
        <h2>Saldo {activeTab === 'me' ? 'Meu' : 'Dela'}</h2>
        <div className="amount">{formatCurrency(balance)}</div>
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
        <h3>Histórico de Transações {activeTab === 'me' ? '(Minhas)' : '(Delas)'}</h3>
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma transação ainda. Adicione sua primeira transação acima! 📝</p>
          </div>
        ) : (
          <div className="transaction-list">
            {filteredTransactions.map(transaction => (
              <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                <div className="transaction-info">
                  <div className="description">
                    {transaction.description}
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

      {/* Mensagem romântica */}
      <div className="love-message">
        <span className="love-text">M</span>
        <span className="heart">❤️</span>
        <span className="love-text">A</span>
      </div>
    </div>
  )
}

export default App

