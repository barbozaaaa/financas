import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'

// App de controle financeiro para Andrey e Maria

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('income')
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState('')
  const [activeTab, setActiveTab] = useState('andrey') // 'andrey' ou 'maria'

  // Carregar dados do Firestore em tempo real - collections separadas
  useEffect(() => {
    setLoading(true)
    setError(null)
    
    try {
      // Collection baseada na aba ativa
      const collectionName = activeTab === 'andrey' ? 'transactions_andrey' : 'transactions_maria'
      const transactionsRef = collection(db, collectionName)
      
      const unsubscribe = onSnapshot(
        transactionsRef, 
        (snapshot) => {
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
          setLoading(false)
        },
        (error) => {
          console.error('Erro ao carregar transações:', error)
          setError('Erro ao carregar dados. Verifique sua conexão.')
          setLoading(false)
        }
      )

      // Carregar renda mensal (separada por pessoa)
      const incomeCollection = activeTab === 'andrey' ? 'settings_andrey' : 'settings_maria'
      const incomeRef = doc(db, incomeCollection, 'monthlyIncome')
      getDoc(incomeRef).then((docSnap) => {
        if (docSnap.exists()) {
          const income = docSnap.data().value
          setMonthlyIncome(income)
          setMonthlyIncomeInput(income.toString())
        } else {
          setMonthlyIncome(0)
          setMonthlyIncomeInput('')
        }
      }).catch((error) => {
        console.error('Erro ao carregar renda mensal:', error)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Erro ao inicializar:', error)
      setError('Erro ao conectar com o banco de dados.')
      setLoading(false)
    }
  }, [activeTab])

  // Transações já vêm filtradas da collection correta
  const filteredTransactions = transactions
  
  // Calcular saldo total (apenas transações, renda mensal já está incluída como transação)
  const balance = filteredTransactions.reduce((total, transaction) => {
    return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
  }, 0)

  // Calcular total de receitas
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)
  
  // Calcular total de despesas
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)

  // Definir renda mensal esperada e adicionar automaticamente ao saldo
  const handleSetMonthlyIncome = async (e) => {
    e.preventDefault()
    const income = parseFloat(monthlyIncomeInput)
    if (income > 0) {
      try {
        // Salvar renda mensal na collection correta
        const incomeCollection = activeTab === 'andrey' ? 'settings_andrey' : 'settings_maria'
        const incomeRef = doc(db, incomeCollection, 'monthlyIncome')
        await setDoc(incomeRef, { value: income })
        
        // Verificar se já existe uma transação de "Renda Mensal" deste mês
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const existingIncome = transactions.find(t => 
          t.description === 'Renda Mensal' &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
        )
        
        // Collection de transações baseada na aba ativa
        const transactionsCollection = activeTab === 'andrey' ? 'transactions_andrey' : 'transactions_maria'
        
        if (!existingIncome) {
          // Adicionar automaticamente como transação de renda
          const incomeTransaction = {
            description: 'Renda Mensal',
            amount: income,
            type: 'income',
            date: new Date().toISOString(),
            dateFormatted: new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
          await addDoc(collection(db, transactionsCollection), incomeTransaction)
        } else {
          // Atualizar a transação existente
          await setDoc(doc(db, transactionsCollection, existingIncome.id), {
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

  // Marcar valor faltante como recebido
  const handleMarkAsReceived = async () => {
    const remaining = monthlyIncome - totalIncome
    if (remaining <= 0) {
      alert('Você já recebeu toda a renda mensal!')
      return
    }

    if (window.confirm(`Marcar ${formatCurrency(remaining)} como recebido?`)) {
      try {
        const transactionsCollection = activeTab === 'andrey' ? 'transactions_andrey' : 'transactions_maria'
        
        const receivedTransaction = {
          description: 'Recebimento Completo da Renda',
          amount: remaining,
          type: 'income',
          date: new Date().toISOString(),
          dateFormatted: new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        
        await addDoc(collection(db, transactionsCollection), receivedTransaction)
        alert('Valor marcado como recebido com sucesso!')
      } catch (error) {
        console.error('Erro ao marcar como recebido:', error)
        alert('Erro ao marcar como recebido. Tente novamente.')
      }
    }
  }

  // Resetar o mês (apenas da aba ativa)
  const resetMonth = async () => {
    const personName = activeTab === 'andrey' ? 'do Andrey' : 'da Maria'
    if (window.confirm(`Tem certeza que deseja resetar o mês? Todas as transações ${personName} serão excluídas!`)) {
      try {
        // Collection de transações baseada na aba ativa
        const transactionsCollection = activeTab === 'andrey' ? 'transactions_andrey' : 'transactions_maria'
        
        // Deletar todas as transações da collection
        const deletePromises = transactions.map(transaction => 
          deleteDoc(doc(db, transactionsCollection, transaction.id))
        )
        await Promise.all(deletePromises)
        
        // Resetar renda mensal
        const incomeCollection = activeTab === 'andrey' ? 'settings_andrey' : 'settings_maria'
        const incomeRef = doc(db, incomeCollection, 'monthlyIncome')
        await setDoc(incomeRef, { value: 0 })
        setMonthlyIncome(0)
        setMonthlyIncomeInput('')
        
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
      // Collection baseada na aba ativa (separada)
      const transactionsCollection = activeTab === 'andrey' ? 'transactions_andrey' : 'transactions_maria'
      
      const newTransaction = {
        description: description.trim(),
        amount: parseFloat(amount),
        type: type,
        date: new Date().toISOString(),
        dateFormatted: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      await addDoc(collection(db, transactionsCollection), newTransaction)
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
        // Collection baseada na aba ativa
        const transactionsCollection = activeTab === 'andrey' ? 'transactions_andrey' : 'transactions_maria'
        await deleteDoc(doc(db, transactionsCollection, id))
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

  // Obter nome do mês atual
  const getCurrentMonth = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[new Date().getMonth()]
  }

  // Mostrar loading ou erro
  if (loading) {
    return (
      <div className="app">
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn"
            style={{ marginTop: '20px' }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <h1>💰 Controle de Finanças</h1>
      <p className="month-label">{getCurrentMonth()}</p>

      {/* Abas para alternar entre Andrey e Maria */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'andrey' ? 'active' : ''}`}
          onClick={() => setActiveTab('andrey')}
        >
          👤 Andrey
        </button>
        <button 
          className={`tab ${activeTab === 'maria' ? 'active' : ''}`}
          onClick={() => setActiveTab('maria')}
        >
          💕 Maria
        </button>
      </div>

      <div className="balance">
        <h2>Saldo {activeTab === 'andrey' ? 'do Andrey' : 'da Maria'}</h2>
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
            <div className="income-item income-item-remaining">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <span className="income-label">Falta Receber:</span>
                  <span className="income-value income-remaining">
                    {formatCurrency(Math.max(0, monthlyIncome - totalIncome))}
                  </span>
                </div>
                {monthlyIncome - totalIncome > 0 && (
                  <button
                    type="button"
                    className="btn-received"
                    onClick={handleMarkAsReceived}
                    title="Marcar como recebido"
                  >
                    ✓ Recebido
                  </button>
                )}
              </div>
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
        <h3>Histórico de Transações {activeTab === 'andrey' ? '(Andrey)' : '(Maria)'}</h3>
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

