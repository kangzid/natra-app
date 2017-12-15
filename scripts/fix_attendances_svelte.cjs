const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const pageFile = path.join(svelteDir, 'src/routes/admin/attendances/+page.svelte');
let content = fs.readFileSync(pageFile, 'utf8');

const target = `    // Derived
    let filteredEmployees = $derived(
        (data.employees || []).filter((emp: Employee) => {
            const name = emp.user?.name || "";
            const empId = emp.employee_id || "";
            return (
        let newYear = currentYear;`;

const replacement = `    // Derived
    let filteredEmployees = $derived(
        (data.employees || []).filter((emp: Employee) => {
            const name = emp.user?.name || "";
            const empId = emp.employee_id || "";
            return (
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                empId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        })
    );

    // Pagination State
    let currentPage = $state(1);
    const itemsPerPage = 10;
    
    let totalPages = $derived(Math.ceil(filteredEmployees.length / itemsPerPage));
    let paginatedEmployees = $derived(
        filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Reset pagination to page 1 on search change
    $effect(() => {
        searchTerm;
        currentPage = 1;
    });

    let monthName = $derived(
        new Date(currentYear, currentMonth - 1).toLocaleString("default", {
            month: "long",
        })
    );

    $effect(() => {
        if (!selectedEmployee && data.employees && data.employees.length > 0) {
            selectEmployee(data.employees[0]);
        }
    });

    async function selectEmployee(employee: Employee) {
        selectedEmployee = employee;
        await fetchAttendance();
    }

    async function fetchAttendance() {
        if (!selectedEmployee) return;
        isLoading = true;
        try {
            attendanceData = await attendanceService.getEmployeeAttendance(
                token,
                selectedEmployee.id,
                currentMonth,
                currentYear
            );
        } catch (error) {
            console.error(error);
            attendanceData = {
                month: currentMonth,
                year: currentYear,
                days_in_month: 0,
                attendances: []
            };
        } finally {
            isLoading = false;
        }
    }

    async function changeMonth(delta: number) {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;`;

content = content.replace(target, replacement);
fs.writeFileSync(pageFile, content, 'utf8');
console.log('Fixed +page.svelte for attendances page!');
