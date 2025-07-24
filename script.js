<script>
        // Definición de las materias y sus propiedades, agrupadas por año
        // Puedes personalizar esta estructura con tus propias materias, códigos, requisitos, etc.
        const allCoursesData = [
            { year: 'CBC', courses: [
                { id: 'cbc-dibujo', name: 'Dibujo', prerequisites: [] },
                { id: 'cbc-proyectual1', name: 'Proyectual I', prerequisites: [] },
                { id: 'cbc-proyectual2', name: 'Proyectual II', prerequisites: ['cbc-proyectual1'] },
                { id: 'cbc-semiologia', name: 'Semiología', prerequisites: [] },
                { id: 'cbc-matematica', name: 'Matemática', prerequisites: [] },
                { id: 'cbc-pensamiento', name: 'Pensamiento Científico', prerequisites: [] },
                { id: 'cbc-sociedad', name: 'Sociedad y Estado', prerequisites: [] },
            ]},
            { year: 'PRIMER AÑO', courses: [
                { id: 'dg1', name: 'DG1.Diseño Gráfico I', prerequisites: [] },
                { id: 'm1', name: 'M1.Morfología I', prerequisites: [] },
                { id: 'tip1', name: 'TIP1. TIPOGRAFÍA I', prerequisites: [] },
                { id: 'h1', name: 'H1.Historia I', prerequisites: [] },
                { id: 'c1', name: 'C1.Comunicación I', prerequisites: [] },
                { id: 'tec1', name: 'TEC1.Tecnología I', prerequisites: [] },
                { id: 'electiva-fotografia', name: 'ELECTIVA.Fotografía', prerequisites: [] },
                { id: 'electiva-ilustracion', name: 'ELECTIVA.Ilustración', prerequisites: [] },
            ]},
            { year: 'SEGUNDO AÑO', courses: [
                { id: 'dg2', name: 'DG2.Diseño Gráfico II', prerequisites: ['dg1'] },
                { id: 'm2', name: 'M1.Morfología II', prerequisites: ['m1'] },
                { id: 'c2', name: 'C2.Comunicacion II', prerequisites: ['c1'] },
                { id: 'tec2', name: 'TEC2.Tecnología II', prerequisites: ['tec1'] },
                { id: 'me1', name: 'ME1.Medios Expresivos I', prerequisites: [] },
            ]},
            { year: 'TERCER AÑO', courses: [
                { id: 'dg3', name: 'DG3.Diseño Gráfico III', prerequisites: ['dg2'] },
                { id: 'tip2', name: 'TIP2. TIPOGRAFÍA II', prerequisites: ['tip1'] },
                { id: 'me2', name: 'ME2.Medios Expresivos II', prerequisites: ['me1'] },
                { id: 'lpp', name: 'LPP.Legislacion y Practica Profesional', prerequisites: [] },
                { id: 'electiva-socio-humanistica', name: 'ELECTIVA.Socio Humanística', prerequisites: [] },
            ]},
            { year: 'CUARTO AÑO', courses: [
                { id: 'dg4', name: 'DG4.Diseño Gráfico IV', prerequisites: ['dg3'] },
                { id: 'mo1', name: 'MO1. MATERIA OPTATIVA I', prerequisites: [] },
                { id: 'mo2', name: 'MO2. MATERIA OPTATIVA II', prerequisites: [] },
                { id: 'sem1', name: 'SEM1. SEMINARIO OPTATIVO 1', prerequisites: [] },
                { id: 'sem2', name: 'SEM2. SEMINARIO OPTATIVO 2', prerequisites: [] },
                { id: 'sem3', name: 'SEM3. SEMINARIO OPTATIVO 3', prerequisites: [] },
                { id: 'electiva-formacion-orientada1', name: 'ELECTIVA DE FORMACIÓN ORIENTADA (1)', prerequisites: [] },
                { id: 'electiva-formacion-orientada2', name: 'ELECTIVA DE FORMACIÓN ORIENTADA (2)', prerequisites: [] },
            ]},
        ];

        // Aplanamos la estructura para un acceso más fácil a todos los cursos
        const allCoursesFlat = [];
        allCoursesData.forEach(yearData => {
            yearData.courses.forEach(course => {
                allCoursesFlat.push({ ...course, year: yearData.year, defaultStatus: 'pending' });
            });
        });

        let courses = []; // Almacenará el estado actual de las materias con su status

        // --- Funciones para el mensaje modal personalizado ---
        function showMessage(message) {
            document.getElementById('message-text').textContent = message;
            document.getElementById('message-box').classList.remove('hidden');
        }

        function hideMessage() {
            document.getElementById('message-box').classList.add('hidden');
        }

        // --- Funciones de lógica de la malla ---

        // Función para cargar el estado de las materias desde localStorage
        function loadCourses() {
            const savedCourses = localStorage.getItem('studyPlannerCourses');
            if (savedCourses) {
                const parsedSavedCourses = JSON.parse(savedCourses);
                // Mapeamos los cursos originales y aplicamos el estado guardado si existe
                courses = allCoursesFlat.map(course => {
                    const saved = parsedSavedCourses.find(sc => sc.id === course.id);
                    return saved ? { ...course, status: saved.status } : { ...course, status: course.defaultStatus };
                });
            } else {
                // Si no hay datos guardados, usamos el estado por defecto
                courses = allCoursesFlat.map(course => ({ ...course, status: course.defaultStatus }));
            }
            renderCourses();
        }

        // Función para guardar el estado actual de las materias en localStorage
        function saveCourses() {
            localStorage.setItem('studyPlannerCourses', JSON.stringify(courses.map(c => ({ id: c.id, status: c.status }))));
        }

        // Función para verificar si los prerrequisitos están completos
        function checkPrerequisites(courseId) {
            const course = courses.find(c => c.id === courseId);
            if (!course || !course.prerequisites || course.prerequisites.length === 0) {
                return { canProceed: true }; // No hay prerrequisitos
            }

            const missingPrereqs = [];
            course.prerequisites.forEach(prereqId => {
                const prereqCourse = courses.find(c => c.id === prereqId);
                if (!prereqCourse || prereqCourse.status !== 'completed') {
                    missingPrereqs.push(prereqCourse ? prereqCourse.name : `Materia desconocida (${prereqId})`);
                }
            });

            if (missingPrereqs.length > 0) {
                return {
                    canProceed: false,
                    message: `Para cursar "${course.name}", necesitas completar primero: ${missingPrereqs.join(', ')}.`
                };
            }
            return { canProceed: true };
        }

        // Función para verificar si el curso puede ser revertido (si otras materias dependen de él)
        function checkDependencies(courseId) {
            const dependentCourses = courses.filter(c => c.prerequisites && c.prerequisites.includes(courseId));
            const activeDependencies = dependentCourses.filter(c => c.status === 'inProgress' || c.status === 'completed');

            if (activeDependencies.length > 0) {
                const dependentNames = activeDependencies.map(c => c.name).join(', ');
                return {
                    canProceed: false,
                    message: `No puedes revertir "${courses.find(c => c.id === courseId).name}" porque las siguientes materias dependen de ella y están en curso/completadas: ${dependentNames}.`
                };
            }
            return { canProceed: true };
        }

        // Función para renderizar las tarjetas de las materias
        function renderCourses() {
            const mallaContainer = document.getElementById('malla-container');
            mallaContainer.innerHTML = ''; // Limpiar el contenido actual

            // Agrupar cursos por año para la visualización
            const coursesByYear = allCoursesData.reduce((acc, yearData) => {
                acc[yearData.year] = yearData.courses.map(course =>
                    courses.find(c => c.id === course.id) || { ...course, status: course.defaultStatus }
                );
                return acc;
            }, {});

            for (const year in coursesByYear) {
                const yearSection = document.createElement('div');
                yearSection.className = 'mb-8';

                const yearTitle = document.createElement('h2');
                yearTitle.className = 'text-2xl sm:text-3xl font-bold text-accent mb-4 border-b-2 border-accent pb-2';
                yearTitle.textContent = year;
                yearSection.appendChild(yearTitle);

                const courseGrid = document.createElement('div');
                // Grid responsivo: 1 columna en móvil, 2 en sm, 3 en md, 4 en lg, 5 en xl
                courseGrid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';

                coursesByYear[year].forEach(course => {
                    const courseCard = document.createElement('div');
                    courseCard.id = `course-${course.id}`;
                    courseCard.className = `
                        course-card
                        bg-white
                        p-6
                        rounded-xl
                        shadow-md
                        border-2
                        cursor-pointer
                        transition-all
                        duration-300
                        ease-in-out
                        flex flex-col
                        justify-between
                        transform hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50
                    `;

                    // Determinar el color del borde y fondo según el estado
                    let borderColor = '';
                    let bgColor = '';
                    let textColor = 'text-darkText'; // Color de texto por defecto

                    switch (course.status) {
                        case 'pending':
                            borderColor = 'border-pending';
                            bgColor = 'bg-gray-50';
                            break;
                        case 'inProgress':
                            borderColor = 'border-inProgress';
                            bgColor = 'bg-yellow-50';
                            break;
                        case 'completed':
                            borderColor = 'border-completed';
                            bgColor = 'bg-green-50';
                            break;
                        default:
                            borderColor = 'border-gray-200';
                            bgColor = 'bg-white';
                    }
                    courseCard.classList.add(borderColor, bgColor);

                    // Título de la materia
                    const courseName = document.createElement('h3');
                    courseName.className = `text-xl font-semibold mb-2 ${textColor}`;
                    courseName.textContent = course.name;
                    courseCard.appendChild(courseName);

                    // Estado actual de la materia
                    const courseStatus = document.createElement('p');
                    courseStatus.className = `text-sm font-medium ${textColor}`;
                    courseStatus.textContent = `Estado: ${
                        course.status === 'pending' ? 'Pendiente' :
                        course.status === 'inProgress' ? 'En Curso' :
                        'Completada'
                    }`;
                    courseCard.appendChild(courseStatus);

                    // Requisitos (si los hay)
                    if (course.prerequisites && course.prerequisites.length > 0) {
                        const prereqContainer = document.createElement('div');
                        prereqContainer.className = 'mt-2 text-xs text-gray-600';
                        const prereqTitle = document.createElement('span');
                        prereqTitle.className = 'font-semibold';
                        prereqTitle.textContent = 'Requisitos: ';
                        prereqContainer.appendChild(prereqTitle);

                        const prereqList = document.createElement('ul');
                        prereqList.className = 'list-disc list-inside ml-2';
                        course.prerequisites.forEach(prereqId => {
                            const prereqCourse = allCoursesFlat.find(c => c.id === prereqId);
                            if (prereqCourse) {
                                const listItem = document.createElement('li');
                                listItem.textContent = prereqCourse.name;
                                prereqList.appendChild(listItem);
                            }
                        });
                        prereqContainer.appendChild(prereqList);
                        courseCard.appendChild(prereqContainer);
                    }

                    // Event listener para cambiar el estado al hacer clic
                    courseCard.addEventListener('click', () => toggleCourseStatus(course.id));

                    courseGrid.appendChild(courseCard);
                });
                yearSection.appendChild(courseGrid);
                mallaContainer.appendChild(yearSection);
            }
        }

        // Función para cambiar el estado de una materia
        function toggleCourseStatus(courseId) {
            const courseIndex = courses.findIndex(c => c.id === courseId);
            if (courseIndex > -1) {
                const currentStatus = courses[courseIndex].status;
                let newStatus = 'pending'; // Por defecto

                if (currentStatus === 'pending') {
                    // Si está pendiente, intenta pasar a En Curso
                    const prereqCheck = checkPrerequisites(courseId);
                    if (!prereqCheck.canProceed) {
                        showMessage(prereqCheck.message);
                        return; // No permite el cambio
                    }
                    newStatus = 'inProgress';
                } else if (currentStatus === 'inProgress') {
                    // Si está en curso, intenta pasar a Completada
                    newStatus = 'completed';
                } else if (currentStatus === 'completed') {
                    // Si está completada, intenta volver a Pendiente
                    const dependencyCheck = checkDependencies(courseId);
                    if (!dependencyCheck.canProceed) {
                        showMessage(dependencyCheck.message);
                        return; // No permite el cambio
                    }
                    newStatus = 'pending';
                }

                courses[courseIndex].status = newStatus;
                saveCourses(); // Guardar el nuevo estado
                renderCourses(); // Volver a renderizar la malla
            }
        }

        // Función para restablecer la malla a su estado por defecto
        function resetPlanner() {
            showMessage('¿Estás seguro de que quieres restablecer toda la malla? Se perderá tu progreso.', true); // true para confirmar
            document.getElementById('message-ok-button').onclick = () => {
                localStorage.removeItem('studyPlannerCourses');
                loadCourses(); // Recargar para mostrar el estado por defecto
                hideMessage();
            };
            // Si el usuario cierra el mensaje sin confirmar, no se hace nada.
        }

        // Event listener para el botón de restablecer
        document.getElementById('reset-button').addEventListener('click', resetPlanner);

        // Event listener para el botón OK del mensaje modal
        document.getElementById('message-ok-button').addEventListener('click', hideMessage);


        // Cargar las materias cuando la página se carga
        window.onload = loadCourses;
    </script>
