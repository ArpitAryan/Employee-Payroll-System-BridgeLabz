// server.js
const express = require("express");
const path = require("path");
const fileHandler = require("./modules/fileHandler");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// parse urlencoded body (form submissions)
app.use(express.urlencoded({ extended: true }));

// Dashboard - list employees
app.get("/", async (req, res) => {
  const employees = await fileHandler.read();
  res.render("index", { employees });
});

// Show add form
app.get("/add", (req, res) => {
  const error = req.query.error || "";
  res.render("add", { error });
});

// Handle add form
app.post("/add", async (req, res) => {
  const { name = "", department = "", basicSalary = "" } = req.body;
  const salaryNum = Number(basicSalary);

  // validation: non-empty name, salary is number and >= 0
  if (!name.trim() || isNaN(salaryNum) || salaryNum < 0) {
    const msg = encodeURIComponent("Invalid input: name required and salary must be >= 0");
    return res.redirect("/add?error=" + msg);
  }

  const employees = await fileHandler.read();

  const newEmployee = {
    id: Date.now(), // unique ID as required
    name: name.trim(),
    department: department.trim() || "N/A",
    basicSalary: salaryNum
  };

  employees.push(newEmployee);
  await fileHandler.write(employees);
  res.redirect("/");
});

// Delete employee
app.get("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);
  let employees = await fileHandler.read();
  employees = employees.filter(emp => Number(emp.id) !== id);
  await fileHandler.write(employees);
  res.redirect("/");
});

// Show edit form
app.get("/edit/:id", async (req, res) => {
  const id = Number(req.params.id);
  const employees = await fileHandler.read();
  const employee = employees.find(emp => Number(emp.id) === id);
  if (!employee) return res.redirect("/"); // not found → redirect
  const error = req.query.error || "";
  res.render("edit", { employee, error });
});

// Handle edit
app.post("/edit/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name = "", department = "", basicSalary = "" } = req.body;
  const salaryNum = Number(basicSalary);

  if (!name.trim() || isNaN(salaryNum) || salaryNum < 0) {
    const msg = encodeURIComponent("Invalid input: name required and salary must be >= 0");
    return res.redirect(`/edit/${id}?error=` + msg);
  }

  const employees = await fileHandler.read();
  const updated = employees.map(emp => {
    if (Number(emp.id) === id) {
      return {
        ...emp,
        name: name.trim(),
        department: department.trim() || "N/A",
        basicSalary: salaryNum
      };
    }
    return emp;
  });

  await fileHandler.write(updated);
  res.redirect("/");
});

// Start server and print loaded employees (Goal from Step 1)
app.listen(PORT, async () => {
  const employees = await fileHandler.read();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Employee Data Loaded:", employees);
});
