document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('student-form');
    const studentList = document.getElementById('student-list');
    const emptyMessage = document.getElementById('empty-message');
    const submitBtn = document.getElementById('submit-btn');
    const sortSelect = document.getElementById('sort-by');
    const searchInput = document.getElementById('search-input');
    
    // NEW: Get the error message elements
    const fnInput = document.getElementById('fn');
    const fnError = document.getElementById('fn-error');
    const gradeInput = document.getElementById('grade');

    // --- Utility Functions ---

    const loadStudents = () => {
        const students = JSON.parse(localStorage.getItem('students')) || [];
        return students;
    };

    const saveStudents = (students) => {
        localStorage.setItem('students', JSON.stringify(students));
    };

    // --- Core Features ---

    // 1. Input Validation (Now uses the dedicated error message div)
    const validateInputs = (fn, grade) => {
        let isValid = true;
        fnError.textContent = ''; // Clear previous error

        if (fn.toString().length !== 10) {
            fnError.textContent = 'Факултетният номер трябва да бъде точно 10 цифри!';
            isValid = false;
        }

        if (grade < 2.00 || grade > 6.00) {
            // Since we didn't add a placeholder for grade, we'll keep the alert for grade
            if (isValid) { // Only alert if FN is correct
                alert('Оценката трябва да е между 2.00 и 6.00!');
            }
            isValid = false;
        }
        
        return isValid;
    };
    
    // 2. Sorting Logic (Remains the same)
    const getSortedStudents = (students) => {
        const [key, order] = sortSelect.value.split('-');
        
        return students.sort((a, b) => {
            let comparison = 0;

            if (key === 'name') {
                comparison = a.name.localeCompare(b.name, 'bg');
            } else if (key === 'grade' || key === 'fn') {
                comparison = a[key] - b[key]; 
            }

            return order === 'asc' ? comparison : -comparison;
        });
    };
    
    // 3. Filtering/Searching Logic (Remains the same)
    const getFilteredStudents = (students) => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (!searchTerm) return students;

        return students.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.fn.toString().includes(searchTerm)
        );
    };

    // 4. Render the table rows (Remains the same)
    const renderStudents = () => {
        let students = loadStudents();
        students = getFilteredStudents(students);
        students = getSortedStudents(students);

        studentList.innerHTML = '';

        if (students.length === 0) {
            emptyMessage.style.display = 'block';
            emptyMessage.textContent = searchInput.value 
                ? 'Няма намерени студенти по това търсене.' 
                : 'Няма добавени студенти.';
            return;
        } else {
            emptyMessage.style.display = 'none';
        }

        students.forEach(student => {
            const row = studentList.insertRow();
            
            row.insertCell().textContent = student.name;
            row.insertCell().textContent = student.fn;
            row.insertCell().textContent = student.grade.toFixed(2);

            const actionsCell = row.insertCell();
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактирай';
            editBtn.className = 'action-btn edit-btn';
            editBtn.addEventListener('click', () => editStudent(student.id));
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Изтрий';
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.addEventListener('click', () => deleteStudent(student.id));
            actionsCell.appendChild(deleteBtn);
        });
    };

    // --- CRUD: CREATE & UPDATE ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('student-id').value;
        const name = document.getElementById('name').value;
        const fn = parseInt(fnInput.value);
        const grade = parseFloat(gradeInput.value);

        // Run validation check
        if (!validateInputs(fn, grade)) {
            return; // Stop form submission if validation fails
        }

        let students = loadStudents();

        if (id) {
            // UPDATE Logic
            const studentIndex = students.findIndex(s => s.id === id);
            if (studentIndex > -1) {
                students[studentIndex] = { id, name, fn, grade };
            }
            document.getElementById('student-id').value = '';
            submitBtn.textContent = 'Добави Студент'; 
        } else {
            // CREATE Logic
            const newStudent = {
                id: Date.now().toString(),
                name: name,
                fn: fn,
                grade: grade
            };
            students.push(newStudent);
        }

        saveStudents(students);
        form.reset();
        renderStudents();
    });

    // --- CRUD: EDIT (Load data into form) ---
    window.editStudent = (id) => {
        const students = loadStudents();
        const studentToEdit = students.find(s => s.id === id);

        if (studentToEdit) {
            document.getElementById('student-id').value = studentToEdit.id;
            document.getElementById('name').value = studentToEdit.name;
            fnInput.value = studentToEdit.fn;
            gradeInput.value = studentToEdit.grade;
            
            submitBtn.textContent = 'Запази Промените'; 
            form.scrollIntoView({ behavior: 'smooth' });
            fnError.textContent = ''; // Clear error when editing
        }
    };

    // --- CRUD: DELETE ---
    window.deleteStudent = (id) => {
        if (confirm('Сигурни ли сте, че искате да изтриете този студент?')) {
            let students = loadStudents();
            students = students.filter(student => student.id !== id);
            saveStudents(students);
            renderStudents();
        }
    };
    
    // --- NEW: Live validation on input ---
    fnInput.addEventListener('input', () => {
        const fn = fnInput.value;
        if (fn.length !== 10) {
            fnError.textContent = 'Факултетният номер трябва да бъде точно 10 цифри!';
        } else {
            fnError.textContent = '';
        }
    });

    // --- Event Listeners and Initial Load ---
    sortSelect.addEventListener('change', renderStudents);
    searchInput.addEventListener('input', renderStudents);
    renderStudents();
});