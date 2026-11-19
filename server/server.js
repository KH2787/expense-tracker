const pool = require("./db");

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello, Expense Tracker API is running");
});

app.get("/api/recurring-expenses", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM recurring_expenses ORDER BY next_due_date ASC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});


app.post("/api/recurring-expenses", async (req, res) => {
    try{
        const {
            description,
            amount,
            category,
            frequency,
            next_due_date,
        } = req.body;

        const result = await pool.query(
            `INSERT INTO recurring_expenses
                (description, amount, category, frequency, next_due_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                description,
                amount,
                category,
                frequency,
                next_due_date,
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});

app.post("/api/recurring-expenses/process-due", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const dueResult = await client.query(
      `SELECT *
       FROM recurring_expenses
       WHERE active = TRUE
         AND next_due_date <= CURRENT_DATE
       ORDER BY next_due_date ASC
       FOR UPDATE`
    );

    const processed = [];

    for (const recurring of dueResult.rows) {
      const expenseResult = await client.query(
        `INSERT INTO expenses
          (description, amount, category, date)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          recurring.description,
          recurring.amount,
          recurring.category,
          recurring.next_due_date,
        ]
      );

      const recurringResult = await client.query(
        `UPDATE recurring_expenses
         SET next_due_date =
           CASE
             WHEN frequency = 'weekly'
               THEN next_due_date + 7

             WHEN frequency = 'monthly'
               THEN (next_due_date + INTERVAL '1 month')::date

             WHEN frequency = 'yearly'
               THEN (next_due_date + INTERVAL '1 year')::date

             ELSE next_due_date
           END
         WHERE id = $1
         RETURNING *`,
        [recurring.id]
      );

      processed.push({
        expense: expenseResult.rows[0],
        recurringExpense: recurringResult.rows[0],
      });
    }

    await client.query("COMMIT");

    res.json({
      processedCount: processed.length,
      processed,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);
    res.status(500).send("Database error");
  } finally {
    client.release();
  }
});


app.get("/api/income", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM income ORDER BY date DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});

app.post("/api/income", async (req, res) => {
    try {
        const { source, amount, category, date } = req.body;

        const result = await pool.query(
            `INSERT INTO income
                (source, amount, category, date)
            VALUES ($1, $2, $3, $4)
            RETURNING *`
            [source, amount, category, date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.delete("/api/recurring-expenses/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM recurring_expenses
            WHERE id = $1
            RETURNING *`,
            [id]    
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Recurring expense not found");
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});


app.patch("/api/recurring-expenses/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const result = await pool.query(
            `UPDATE recurring_expenses
            SET active = $1
            WHERE id = $2
            RETURNING *`,
            [active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Recurring expense not found");
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});


app.get("/api/expenses", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM expenses ORDER BY id ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).send("Database error");
    }
});


app.post("/api/expenses", async (req, res) => {
    try {
        const { description, amount, category } = req.body;
        const result = await pool.query(
            `INSERT INTO expenses (description, amount, category, date)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [description, amount, category, new Date()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).send("Database error");
    }
});

app.delete("/api/expenses/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query("DELETE FROM expenses WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).send("Expense not found");
    }

    res.json(result.rows[0]);
} catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).send("Database error");
}
});

app.put("/api/expenses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount, category, date } = req.body;

        const result = await pool.query(
            `UPDATE expenses
            SET description = $1, 
                amount = $2, 
                category = $3,
                date = $4
            WHERE id = $5
            RETURNING *`,
            [description, amount, category, date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Expense not found");
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).send("Database error");
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.get("/api/budgets/:month", async (req, res) => {
    try {
        const { month } = req.params;

        const budgetDate = `${month}-01`;

        const result = await pool.query(
            "SELECT * FROM budgets WHERE month = $1",
            [budgetDate]
        );

        if (result.rows.length === 0) {
            return res.json(null);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});


app.put("/api/budgets/:month", async (req, res) => {
    try {
        const { month } = req.params;
        const { amount } = req.body;

        const budgetDate = `${month}-01`;

        const result = await pool.query(
            `INSERT INTO budgets (month, amount)
            VALUES ($1, $2)
            ON CONFLICT (month) DO UPDATE SET amount = EXCLUDED.amount
            RETURNING *`,
            [budgetDate, amount]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
