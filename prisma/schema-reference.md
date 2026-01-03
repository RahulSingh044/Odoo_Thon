# Prisma Schema Reference

This document provides an overview of the database schema structure.

## File Structure

All models are defined in `schema.prisma`, but organized into logical sections:

1. **Core User Models** (lines ~26-68)
   - User
   - EmployeeProfile
   - GlobalSerial

2. **Salary Models** (lines ~70-189)
   - SalaryInfo
   - SalaryComponent & EmployeeSalaryComponent
   - Contribution & EmployeeContribution
   - Deduction & EmployeeDeduction

## Enums

- **Role**: EMPLOYEE, HR
- **ComputationType**: FIXED, PERCENTAGE
- **ComponentBase**: WAGE, BASIC

## Model Relationships

### User Flow
```
User (1) ──< (1) EmployeeProfile (1) ──< (1) SalaryInfo
```

### Salary Structure
```
SalaryInfo (1) ──< (N) EmployeeSalaryComponent ──> (1) SalaryComponent
SalaryInfo (1) ──< (N) EmployeeContribution ──> (1) Contribution
SalaryInfo (1) ──< (N) EmployeeDeduction ──> (1) Deduction
```

## Key Models Explained

### SalaryInfo
Main salary record for each employee. Contains:
- Monthly and yearly wage
- Working schedule info (days per week, break time)
- Links to all salary components, contributions, and deductions

### SalaryComponent vs EmployeeSalaryComponent
- **SalaryComponent**: Template/master definition (e.g., "Basic", "HRA")
- **EmployeeSalaryComponent**: Employee-specific instance with calculated values

### Fixed Allowance Calculation
Fixed Allowance = Monthly Wage - (sum of all other component amounts)

## Usage Examples

### Example: Basic Salary Calculation
If Wage = ₹50,000 and Basic = 50% of Wage:
- Basic = ₹25,000

### Example: HRA Calculation  
If HRA = 50% of Basic and Basic = ₹25,000:
- HRA = ₹12,500

### Example: PF Contribution
If PF = 12% of Basic and Basic = ₹25,000:
- Employee PF = ₹3,000
- Employer PF = ₹3,000

