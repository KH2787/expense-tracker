import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const [formError, setFormError] = useState("");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest"); 

  const [budgetMonth, setBudgetMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [budgetAmount, setBudgetAmount] = useState("");

  const [recurringExpenses, setRecurringExpenses] = useState([]);

  const [recurringDescription, setRecurringDescription] = useState("");
  const [recurringAmount, setRecurringAmount] = useState("");
  const [recurringCategory, setRecurringCategory] = useState("");
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [recurringDueDate, setRecurringDueDate] = useState("");

  const [processingRecurring, setProcessingRecurring] =
    useState(false);

  const [recurringMessage, setRecurringMessage] =
    useState("");

  const [income, setIncome] = useState([]);

  const [incomeSource, setIncomeSource] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeCategory, setIncomeCategory] = useState("");
  const [incomeDate, setIncomeDate] = useState("");


  const fetchIncome = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/income"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch income")
      }

      const data = await response.json();

      setIncome(data);
    } catch (error) {
      console.error("Error fetching income", error)
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const handleIncomeSubmit = async (e) => {
    e.preventdefault();

    if (
      !incomeSource.trim() ||
      !incomeAmount ||
      Number(incomeAmount) <= 0 ||
      !incomeCategory.trim() ||
      !incomeDate
    ) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/income",
        {
          method: "POST",
          headers: {
            "Content-Type" : "application/json",
          },
          body: JSON.stringify({
            source: incomeSource,
            amount: incomeAmont,
            category: incomeCategory,
            date: incomeDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add income");
      }

      const newIncome = await response.json();

      setIncome((current) => [newIncome,...current,]);

      setIncomeSource("");
      setIncomeAmount("");
      setIncomeCategory("");
      setIncomeDate("");
    } catch (error) {
      console.error("Error adding income:", error)
    }
  }

  
  const fetchRecurringExpenses = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/recurring-expenses"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recurring expenses");
    }

    const data = await response.json();

    console.log("Recurring expenses fetched:", data);

    setRecurringExpenses(data);
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
  }
};


  useEffect(() => {
    fetchRecurringExpenses();
  }, []);


  const handleRecurringSubmit = async (e) => {
  e.preventDefault();

  if (
    !recurringDescription.trim() ||
    !recurringAmount ||
    Number(recurringAmount) <= 0 ||
    !recurringCategory.trim() ||
    !recurringFrequency ||
    !recurringDueDate
  ) {
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/recurring-expenses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: recurringDescription,
          amount: recurringAmount,
          category: recurringCategory,
          frequency: recurringFrequency,
          next_due_date: recurringDueDate,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create recurring expense");
    }

    const newRecurringExpense = await response.json();

    setRecurringExpenses((current) => [...current, newRecurringExpense,]);

    setRecurringDescription("");
    setRecurringAmount("");
    setRecurringCategory("");
    setRecurringFrequency("monthly");
    setRecurringDueDate("");
  } catch (error) {
    console.error("Error creating recurring expense:", error);
  }
};


const handleRecurringDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delte this recurring expense?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/recurring-expenses/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete recurring expense");
    }

    setRecurringExpenses((current) => 
      current.filter((expense) => expense.id !== id)
    );
  } catch (error) {
    console.error("Error deleting recurring expnese:", error);
  }
};


const handleRecurringToggle = async (expense) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recurring-expenses/${expense.id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !expense.active,
        }),
      }
    );

    if (!respnose.ok) {
      throw new Error("Failed to update reucrring expnese");
    }

    const updatedExpense = await response.json();

    setRecurringExpneses((current) => 
      current.map((item) =>
        item.id === updatedExpense.id ? updatedExpense : item
        )
      );
  } catch (error) {
    console.error(
      "Error updating recurring expense:",
      error
    );
  }
};

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);


  const fetchExpenses = () => {
    fetch("http://localhost:3000/api/expenses")
      .then((response) => response.json())
      .then((data) => {
        setExpenses(data);
      })
      .catch((error) => {
        console.error("Error fetching expenses:", error);
      });
  };

  
  useEffect(() => {
    fetch(`http://localhost:3000/api/budgets/${budgetMonth}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch budget");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Fetched budget:", data);
        
        if (data) {
          setBudgetAmount(data.amount);
        } else {
          setBudgetAmount("");
        }
      })
      .catch((error) => {
        console.error("Error fetching budget:", error);
      });
  }, [budgetMonth]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setFormError("Please enter a description.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setFormError("Please enter an amount greater than $0.");
      return;
    }

    if (!category.trim()) {
      setFormError("Please enter a category.");
      return;
    }

    if (!date) {
      setFormError("Please select a date.");
      return;
    }

    setFormError("");

    const expenseData = {
      description,
      amount,
      category,
      date,
    };

    console.log("editingID:", editingId);
    console.log("expenseData:", expenseData);

    try {
      if (editingId) {
        const response = await fetch(`http://localhost:3000/api/expenses/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        });

        if(!response.ok) {
          throw new Error("Failed to update expense");
        }

        const updatedExpense = await response.json();

        setExpenses(expenses.map((expense) => 
          (expense.id === editingId ? updatedExpense : expense)));

        setEditingId(null);
      } else {
        const response = await fetch("http://localhost:3000/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        });

        if(!response.ok) {
          throw new Error("Failed to add expense");
        }

        const savedExpense = await response.json();

        setExpenses([...expenses, savedExpense]);
      }
      
      setDescription("");
      setAmount("");
      setCategory("");
      setDate("");
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };


const handleDelete = async (id) => {
  const confirmed = window.confirm("Are you sure you want to delete this expense?");
  if (!confirmed) return;

  try {
    const response = await fetch(`http://localhost:3000/api/expenses/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      throw new Error("Failed to delete expense");
    }

    setExpenses(expenses.filter((expense) => expense.id !== id));
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
};

const handleEdit = (expense) => {
  setEditingId(expense.id);
  setDescription(expense.description);
  setAmount(expense.amount);
  setCategory(expense.category);
  setDate(expense.date.split("T")[0]);
};


const totalSpent = expenses.reduce((total, expense) => {
  return total + Number(expense.amount);
}, 0);

const expenseCount = expenses.length;
const averageExpense = expenseCount > 0 ? totalSpent / expenseCount : 0;


const formatDate = (dateString) => {
  const [year, month, day] = dateString.split("T")[0].split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};



const categories = [
  "All",
  ...new Set(expenses.map((expense) => expense.category)),
];


const filteredExpenses = expenses.filter((expense) => {
  if (categoryFilter === "All") return true;

  return expense.category === categoryFilter;
})
.sort((a, b) => {
  if (sortOrder === "highest") {
    return Number(b.amount) - Number(a.amount);
  }

  if (sortOrder === "lowest") {
    return Number(a.amount) - Number(b.amount);
  }

  if (sortOrder === "oldest") {
    return new Date(a.date) - new Date(b.date);
  }

  return new Date(b.date) - new Date(a.date);
});


const monthlyExpenses = expenses.filter((expense) => {
  return expense.date.split("T")[0].slice(0, 7) === budgetMonth;
});

const monthlySpent = monthlyExpenses.reduce((total, expense) => {
  return total + Number(expense.amount);
}, 0);

const budget = Number(budgetAmount) || 0;

const remainingBudget = budget - monthlySpent;

const budgetPercent = budget > 0 ? (monthlySpent / budget) * 100 : 0;

const progressPercent = Math.min(budgetPercent, 100);


const handleBudgetSave = async () => {
  if (!budgetMonth || Number(budgetAmount) < 0) {
    return;
  }

  try {
    const reponse = await fetch(`http://localhost:3000/api/budgets/${budgetMonth}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: budgetAmount }),
    });

    if (!response.ok) {
      throw new Error("Failed to save budget");
    }

    const savedBudget = await response.json();

    console.log("Budget saved:", savedBudget);

    setBudgetAmount(savedBudget.amount);
  } catch (error) {
    console.error("Error saving budget:", error);
  }
};


const spendingByCategory = expenses.reduce((totals, expense) => {
  const category = expense.category;
  const amount = Number(expense.amount);

  if (totals[category]) {
    totals[category] += amount;
  } else {
    totals[category] = amount;
  }

  return totals;
}, {});


const categoryData = Object.entries(spendingByCategory)
  .map(([category, amount]) => ({
    category,
    amount,
  }))
  .sort((a, b) => b.amount - a.mount);


const highestCategoryAmount =
  categoryData.length > 0 ? categoryData[0].amount : 0;


const handleProcessDueExpenses = async () => {
  try {
    setProcessingRecurring(true);
    setRecurringMessage("");

    const response = await fetch(
      "http://localhost:3000/api/recurring-expenses/process-due",
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to process recurring expenses");
    }

    const data = await response.json();

    setRecurringMessage(
      `${data.processedCount} recurring expense${
        data.processedCount === 1 ? "" : "s"
      } processed.`
    );

    fetchExpenses();
    fetchRecurringExpenses();
  } catch (error) {
    console.error(
      "Error processing recurring expenses:",
      error
    );

    setRecurringMessage(
      "Unable to process recurring expenses."
    );
  } finally {
    setProcessingRecurring(false);
  }
};

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Track and manage your personal spending.</p>
        </div>

        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          aria-label="Toggle light and dark theme">{theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <section className="summary-grid">
        <div  className="summary-card">
          <p>Total Spent</p>
          <h2>${totalSpent.toFixed(2)}</h2> 
        </div>

        <div className="summary-card">
          <p>Expenses</p>
          <h2>{expenseCount}</h2>
        </div>

        <div className="summary-card">
          <p>Average Expense</p>
          <h2>${averageExpense.toFixed(2)}</h2>
        </div>
      </section>

      <section className="budget-section">
        <div className="budget-header">
          <h2>Monthly Budget</h2>

          <input
          type="month"
          value={budgetMonth}
          onChange={(e) => setBudgetMonth(e.target.value)}
          /> 
        </div>

        <div className="budget-input">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Monthly budget"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
          />

          <button onClick={handleBudgetSave} className="primary-button">Save Budget</button>
        </div>

        {budget > 0 && (
          <div className="budget-summary">
            <div className="budget-stats">
              <p>Spent: <strong>${monthlySpent.toFixed(2)}</strong></p>

              <p>Remaining:{" "}<strong>${remainingBudget.toFixed(2)}</strong></p>

              <p>Used: <strong>{budgetPercent.toFixed(1)}%</strong></p>
          </div>

          <div className="budget-progress">
            <div className={`budget-progress-fill ${
              budgetPercent >= 100
                ? "over-budget"
                : budgetPercent >= 80
                ? "near-budget"
                : ""
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {budgetPercent >= 100 && (
          <p className="budget-warning over">
            Budget exceeded by $
            {Math.abs(remainingBudget).toFixed(2)}
          </p>
        )}

        {budgetPercent >= 80 &&  budgetPercent < 100 && (
          <p className="budget-warning near">
            You are approaching your monthly budget.
          </p>
        )}
      </div>
    )}
      </section>

      <section className="category-section">
        <h2>Spending by Category</h2>

        {categoryData.length === 0 ? (
          <p className="category-empty">Add expenses to view category spending.</p>
          ) : (
            <div className="category-list">
              {categoryData.map((item) => {
                const width = highestCategoryAmount > 0 ? (item.amount / highestCategoryAmount) * 100 : 0;

                return (
                  <div className="category-row" key={item.category}>
                    <div className="category-row-header">
                      <span>{item.category}</span>

                      <strong>${item.amount.toFixed(2)}</strong>
                    </div>

                    <div className="category-bar">
                      <div className="category-bar-fill" style={{ width: `${width}%` }}
                      />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>


      <section className="recurring-section">
        <div className="recurring-header">
          <h2>Recurring Expenses</h2>

          <button
            className="primary-button"
            onClick={handleProcessDueExpenses}
            disabled={processingRecurring}
          >
            {processingRecurring ? "Processing..." : "Process Due Expenses"}
          </button>
        </div>

        {recurringMessage && (
          <p className="recurring-message">{recurringMessage}</p>
        )}

        <form
          className="recurring-form"
          onSubmit={handleRecurringSubmit}
        >
        <input
          type="text"
          placeholder="Description"
          value={recurringDescription}
          onChange={(e) =>
          setRecurringDescription(e.target.value)
        }
          required
      />

        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount"
          value={recurringAmount}
          onChange={(e) =>
          setRecurringAmount(e.target.value)
        }
        required
      />

        <input
          type="text"
          placeholder="Category"
          value={recurringCategory}
          onChange={(e) =>
          setRecurringCategory(e.target.value)
        }
        required
      />

        <select
          value={recurringFrequency}
          onChange={(e) =>
          setRecurringFrequency(e.target.value)
        }
      >
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

        <input
          type="date"
          value={recurringDueDate}
          onChange={(e) =>
          setRecurringDueDate(e.target.value)
        }
        required
      />

        <button
          type="submit"
          className="primary-button"
      >
        Add Recurring Expense
        </button>
      </form>

      <div className="recurring-list">
        {recurringExpenses.length === 0 ? (
          <p className="recurring-empty">No recurring expenses yet.</p>
      ) : (
      recurringExpenses.map((expense) => (
        <div
          className={`recurring-card ${
            !expense.active ? "recurring-disabled" : ""
          }`}
          key={expense.id}
        >
          <div>
            <h3>{expense.description}</h3>

            <span className="category-badge">
              {expense.category}
            </span>

            {!expense.active && (
              <span className="recurring-status">
                Disabled
              </span>
            )}
          </div>

          <div className="recurring-details">
            <strong>
              ${Number(expense.amount).toFixed(2)}
            </strong>

            <span>{expense.frequency}</span>

            <span>
              Next: {formatDate(expense.next_due_date)}
            </span>

            <div className="recurring-actions">
              <button
                onClick={() =>
                  handleRecurringToggle(expense)
                }
              >
                {expense.active ? "Disable" : "Enable"}
              </button>

              <button
                className="delete-button"
                onClick={() =>
                  handleRecurringDelete(expense.id)
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</section>

      <section className="income-section">
        <h2>Income</h2>

        <form
          className="income-form"
          onSubmit={handleIncomeSubmit}
        >
          <input
            type="text"
            placeholder="Source"
            value={incomeSource}
            onchange={(e) => 
              setIncomeSource(e.target.value)
            }
            required
          />

          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            value={incomeAmount}
            onChange={(e) =>
              setIncomeAmount(e.target.value)
            }
            required
          />

          <input 
            type="text"
            placeholder="Category"
            value={incomeCategory}
            onChange={(e) =>
              setIncomeCategory(e.target.value)
            }
            required
          />

          <input 
            type="date"
            value={incomeDate}
            onChange={(e) =>
              setIncomeDate(e.target.value)
            }
            required
          />

          <button
            type="submit"
            className="primary-button"
          >
            Add Income
          </button>
        </form>

        <div className="income-list">
          {income.length === 0 ? (
            <p className="income-empty">
              No income recorded yet.
            </p>
          ) : (
            income.map((item) => (
              <div 
                className="income-card" 
                key={item.id}
              >
                <div>
                  <h3>{item.source}</h3>

                  <span className="category-badge">{item.category}</span>
                </div>

                <div className="income-details">
                  <strong>${Number(item.amount).toFixed(2)}</strong>

                  <span>{formatDate(item.date)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>


      <main className="dashboard">
        <section className="form-section">

          <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>

          {formError && (
            <div className="form-error">{formError}</div>
          )}

          <form onSubmit={handleSubmit} className="expense-form">
            <label htmlFor="description">Description</label> 
              <input
                id = "description"
                type="text"
                placeholder="Example: Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            

            <label htmlFor="amount">Amount</label>
              <input
                id = "amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

            <label htmlFor="category">Category</label>
              <input
                id = "category"
                type="text"
                placeholder="Example: Food"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />

            <label htmlFor="date">Date</label>
              <input
                id = "date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

            <button type="submit" className="primary-button">
              {editingId ? "Update Expense" : "Add Expense"}
            </button>
          </form>
        </section>

        <section className="expenses-section">
          <h2>Expenses</h2>

          <div className="expense-controls"> 
            <label>
              Category
              <select 
                value ={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
            </label>

            <label>
              Sort By
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </label>
          </div>

          <div className="expense-list">
            {filteredExpenses.length === 0 ? (

              <div className="empty-state">
              <h3>No expenses yet.</h3>
              <p>Add your first expense using the form.</p>
            </div>
            ) : (
              filteredExpenses.map((expense) => (
                <div className="expense-card" key={expense.id}>
                  <div>

                    <h3>{expense.description}</h3>
                    <span className="category-badge">{expense.category}</span>
                  </div>

                  <div className="expense-details">
                    <strong>${expense.amount}</strong>
                    <span className = "expense-date">{formatDate(expense.date)}</span>

                    <div className="expense-actions">
                      <button onClick={() => handleEdit(expense)}>Edit</button>
                    <button className="delete-button" onClick={() => handleDelete(expense.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}    
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;