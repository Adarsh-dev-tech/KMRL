// Main JavaScript for KMRL Government Portal

document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'dashboard.html' || currentPage === '') {
        initializeDashboard();
    } else if (currentPage === 'index.html') {
        initializeLogin();
    } else if (currentPage === 'register.html') {
        initializeRegister();
    }
});

// Login Page Functions
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('userId').value;
            const password = document.getElementById('password').value;
            
            if (userId && password) {
                // Simple validation - in real app, this would be server-side
                if (userId.length >= 3 && password.length >= 6) {
                    showNotification('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showNotification('Invalid credentials. Please try again.', 'error');
                }
            } else {
                showNotification('Please fill in all fields.', 'error');
            }
        });
    }
}

// Register Page Functions
function initializeRegister() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const department = document.getElementById('department').value;
            const employeeId = document.getElementById('employeeId').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (department && employeeId && newPassword && confirmPassword) {
                if (newPassword !== confirmPassword) {
                    showNotification('Passwords do not match!', 'error');
                    return;
                }
                
                if (newPassword.length < 6) {
                    showNotification('Password must be at least 6 characters long!', 'error');
                    return;
                }
                
                showNotification('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showNotification('Please fill in all fields.', 'error');
            }
        });
    }
}

// Dashboard Functions
function initializeDashboard() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    initializeNavigation();
    initializeFloatingSearch();
    initializeFileUpload();
    initializeDocumentViewer();
    initializeProfileDropdown();
    initializeDepartmentFilter();
    initializeSearchInterface();
    loadDepartmentDocuments('all');
}

function updateDateTime() {
    const dateTimeElement = document.getElementById('dateTime');
    if (dateTimeElement) {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageContents = document.querySelectorAll('.page-content');
    const floatingSearch = document.getElementById('floatingSearch');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetPage = this.getAttribute('data-page');
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all page contents
            pageContents.forEach(page => page.classList.add('hidden'));
            
            // Show target page
            const targetElement = document.getElementById(targetPage + '-page');
            if (targetElement) {
                targetElement.classList.remove('hidden');
            }
            
            // Show/hide floating search button only on updates page
            if (floatingSearch) {
                if (targetPage === 'updates') {
                    floatingSearch.style.display = 'block';
                } else {
                    floatingSearch.style.display = 'none';
                }
            }
        });
    });
}

function initializeFloatingSearch() {
    const searchToggle = document.getElementById('searchToggle');
    
    if (searchToggle) {
        searchToggle.addEventListener('click', function() {
            // Navigate to search page
            const navItems = document.querySelectorAll('.nav-item');
            const pageContents = document.querySelectorAll('.page-content');
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to search nav item
            const searchNavItem = document.querySelector('[data-page="search"]');
            if (searchNavItem) {
                searchNavItem.classList.add('active');
            }
            
            // Hide all page contents
            pageContents.forEach(page => page.classList.add('hidden'));
            
            // Show search page
            const searchPage = document.getElementById('search-page');
            if (searchPage) {
                searchPage.classList.remove('hidden');
                // Focus on search input
                const mainSearchInput = document.getElementById('mainSearchInput');
                if (mainSearchInput) {
                    setTimeout(() => mainSearchInput.focus(), 100);
                }
            }
            
            // Hide floating search button
            this.parentElement.style.display = 'none';
        });
    }
}

function performSearch(query) {
    if (query.trim()) {
        showNotification(`Searching for: "${query}"`, 'info');
        // In a real application, this would perform actual search
        console.log('Performing search for:', query);
    }
}

function initializeFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const linkInput = document.getElementById('linkInput');
    const uploadedFiles = document.getElementById('uploadedFiles');
    
    if (uploadArea && fileInput) {
        // Click to upload
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        // File input change
        fileInput.addEventListener('change', function(e) {
            handleFiles(e.target.files);
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#35b6b9';
            this.style.background = 'rgba(53, 182, 185, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(53, 182, 185, 0.5)';
            this.style.background = 'rgba(255, 255, 255, 0.05)';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(53, 182, 185, 0.5)';
            this.style.background = 'rgba(255, 255, 255, 0.05)';
            
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }
    
    // Add link functionality
    if (addLinkBtn && linkInput) {
        addLinkBtn.addEventListener('click', function() {
            const link = linkInput.value.trim();
            if (link && isValidURL(link)) {
                addLinkToList(link);
                linkInput.value = '';
                showNotification('Link added successfully!', 'success');
            } else {
                showNotification('Please enter a valid URL!', 'error');
            }
        });
        
        linkInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addLinkBtn.click();
            }
        });
    }
}

function handleFiles(files) {
    const uploadedFiles = document.getElementById('uploadedFiles');
    
    Array.from(files).forEach(file => {
        const fileItem = createFileItem(file.name, file.size, 'file');
        uploadedFiles.appendChild(fileItem);
    });
    
    showNotification(`${files.length} file(s) uploaded successfully!`, 'success');
}

function addLinkToList(link) {
    const uploadedFiles = document.getElementById('uploadedFiles');
    const linkItem = createFileItem(link, null, 'link');
    uploadedFiles.appendChild(linkItem);
}

function createFileItem(name, size, type) {
    const item = document.createElement('div');
    item.className = 'uploaded-item';
    item.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        margin: 5px 0;
        background: rgba(53, 182, 185, 0.1);
        border: 1px solid rgba(53, 182, 185, 0.3);
        border-radius: 8px;
        color: #ffffff;
    `;
    
    const icon = type === 'file' ? 'fas fa-file' : 'fas fa-link';
    const sizeText = size ? ` (${formatFileSize(size)})` : '';
    
    item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="${icon}" style="color: #35b6b9;"></i>
            <span>${name}${sizeText}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: #ff6b6b;
            cursor: pointer;
            font-size: 1.1rem;
        ">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    return item;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function initializeDocumentViewer() {
    const documentItems = document.querySelectorAll('.document-item');
    
    documentItems.forEach(item => {
        const header = item.querySelector('.document-header');
        const content = item.querySelector('.document-content');
        
        if (header && content) {
            header.addEventListener('click', function() {
                const isExpanded = !content.classList.contains('hidden');
                
                // Close all other expanded items
                documentItems.forEach(otherItem => {
                    const otherContent = otherItem.querySelector('.document-content');
                    if (otherContent && otherItem !== item) {
                        otherContent.classList.add('hidden');
                    }
                });
                
                // Toggle current item
                if (isExpanded) {
                    content.classList.add('hidden');
                } else {
                    content.classList.remove('hidden');
                }
            });
        }
    });
    
    // Handle document action buttons
    const actionButtons = document.querySelectorAll('.document-actions button');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

// Profile Dropdown Functions
function initializeProfileDropdown() {
    const profileBtn = document.querySelector('.profile-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (profileBtn && dropdownContent) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
                dropdownContent.style.display = 'none';
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Logging out...', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

// Department Filter Functions
function initializeDepartmentFilter() {
    const departmentBtn = document.getElementById('departmentBtn');
    const departmentDropdown = document.getElementById('departmentDropdown');
    
    if (departmentBtn && departmentDropdown) {
        departmentBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            departmentDropdown.classList.toggle('active');
        });
        
        // Handle department selection
        departmentDropdown.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const selectedDept = e.target.getAttribute('data-dept');
                const deptText = e.target.textContent;
                
                // Update button text
                departmentBtn.innerHTML = `<i class="fas fa-building"></i> ${deptText} <i class="fas fa-chevron-down"></i>`;
                
                // Load documents for selected department
                loadDepartmentDocuments(selectedDept);
                
                // Close dropdown
                departmentDropdown.classList.remove('active');
                
                showNotification(`Showing documents for: ${deptText}`, 'info');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!departmentBtn.contains(e.target) && !departmentDropdown.contains(e.target)) {
                departmentDropdown.classList.remove('active');
            }
        });
    }
}

// Search Interface Functions
function initializeSearchInterface() {
    const searchBtnMain = document.getElementById('searchBtnMain');
    const mainSearchInput = document.getElementById('mainSearchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchBtnMain && mainSearchInput) {
        searchBtnMain.addEventListener('click', function() {
            performAdvancedSearch();
        });
        
        mainSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performAdvancedSearch();
            }
        });
    }
    
    // Initialize filter change listeners
    const filters = ['searchDepartment', 'searchFileType', 'searchDateFrom', 'searchDateTo', 'searchContact'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', performAdvancedSearch);
        }
    });
}

function performAdvancedSearch() {
    const query = document.getElementById('mainSearchInput')?.value || '';
    const department = document.getElementById('searchDepartment')?.value || '';
    const fileType = document.getElementById('searchFileType')?.value || '';
    const dateFrom = document.getElementById('searchDateFrom')?.value || '';
    const dateTo = document.getElementById('searchDateTo')?.value || '';
    const contact = document.getElementById('searchContact')?.value || '';
    
    const searchResults = document.getElementById('searchResults');
    
    if (!query && !department && !fileType && !dateFrom && !dateTo && !contact) {
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Enter search terms to find files and documents</p>
                </div>
            `;
        }
        return;
    }
    
    // Show loading state
    if (searchResults) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching...</p>
            </div>
        `;
    }
    
    // Simulate search results
    setTimeout(() => {
        const mockResults = generateMockSearchResults(query, department, fileType, contact);
        displaySearchResults(mockResults);
    }, 1000);
}

function generateMockSearchResults(query, department, fileType, contact) {
    const allDocuments = {
        finance: [
            { title: 'Monthly Budget Report', type: 'pdf', date: '2024-12-01', contact: 'Finance Manager', dept: 'Finance' },
            { title: 'Invoice Processing Guidelines', type: 'pdf', date: '2024-11-28', contact: 'Accounts Team', dept: 'Finance' },
            { title: 'Revenue Analysis Q4', type: 'excel', date: '2024-12-05', contact: 'Financial Analyst', dept: 'Finance' }
        ],
        operations: [
            { title: 'Train Schedule Updates', type: 'pdf', date: '2024-12-10', contact: 'Operations Head', dept: 'Operations' },
            { title: 'Station Maintenance Log', type: 'excel', date: '2024-12-08', contact: 'Maintenance Team', dept: 'Operations' },
            { title: 'Passenger Flow Analysis', type: 'pdf', date: '2024-12-03', contact: 'Operations Analyst', dept: 'Operations' }
        ],
        hr: [
            { title: 'Employee Handbook 2024', type: 'pdf', date: '2024-11-15', contact: 'HR Manager', dept: 'Human Resources' },
            { title: 'Training Schedule', type: 'word', date: '2024-12-01', contact: 'Training Coordinator', dept: 'Human Resources' },
            { title: 'Performance Reviews', type: 'excel', date: '2024-11-30', contact: 'HR Team', dept: 'Human Resources' }
        ]
    };
    
    let results = [];
    
    // Filter by department
    if (department && department !== '') {
        results = allDocuments[department] || [];
    } else {
        results = Object.values(allDocuments).flat();
    }
    
    // Filter by file type
    if (fileType && fileType !== '') {
        results = results.filter(doc => doc.type === fileType);
    }
    
    // Filter by query
    if (query && query.trim() !== '') {
        results = results.filter(doc => 
            doc.title.toLowerCase().includes(query.toLowerCase()) ||
            doc.contact.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    // Filter by contact
    if (contact && contact.trim() !== '') {
        results = results.filter(doc => 
            doc.contact.toLowerCase().includes(contact.toLowerCase())
        );
    }
    
    return results;
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No documents found matching your search criteria</p>
            </div>
        `;
        return;
    }
    
    const resultsHTML = results.map(doc => `
        <div class="search-result-item">
            <div class="result-header">
                <i class="fas fa-file-${doc.type === 'pdf' ? 'pdf' : doc.type === 'excel' ? 'excel' : doc.type === 'word' ? 'word' : 'alt'}"></i>
                <div class="result-info">
                    <strong>${doc.title}</strong>
                    <div class="result-meta">
                        <span><i class="fas fa-building"></i> ${doc.dept}</span>
                        <span><i class="fas fa-user"></i> ${doc.contact}</span>
                        <span><i class="fas fa-calendar"></i> ${doc.date}</span>
                    </div>
                </div>
            </div>
            <div class="result-actions">
                <button class="btn-download"><i class="fas fa-download"></i> Download</button>
                <button class="btn-view"><i class="fas fa-eye"></i> View</button>
            </div>
        </div>
    `).join('');
    
    searchResults.innerHTML = `
        <div class="search-results-header">
            <h3>Search Results (${results.length} found)</h3>
        </div>
        ${resultsHTML}
    `;
}

// Department Documents Functions
function loadDepartmentDocuments(department) {
    const documentsContainer = document.getElementById('documentsContainer');
    if (!documentsContainer) return;
    
    const documents = getDepartmentDocuments(department);
    
    // Flatten all documents from all sections and categorize by importance
    const allImportantDocs = [];
    const allOtherDocs = [];
    
    documents.forEach(section => {
        if (section.documents.important) {
            allImportantDocs.push(...section.documents.important);
        }
        if (section.documents.others) {
            allOtherDocs.push(...section.documents.others);
        }
    });
    
    documentsContainer.innerHTML = `
        ${renderDocumentCategory(allImportantDocs, 'Important', true)}
        ${renderDocumentCategory(allOtherDocs, 'Others', false)}
    `;
    
    // Reinitialize document viewer for new content
    initializeDocumentViewer();
    
    // Add click event listeners to all document items
    document.querySelectorAll('.document-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Prevent event if clicking on buttons
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            toggleDocumentExpansion(this);
        });
    });
}

function renderDocumentCategory(documents, categoryTitle, isImportant) {
    if (!documents || documents.length === 0) return '';
    
    return `
        <div class="document-category">
            <h4 class="category-title ${isImportant ? 'important' : ''}">
                ${isImportant ? '<i class="fas fa-star important-star"></i>' : ''} ${categoryTitle} ${isImportant ? '*' : ''}
            </h4>
            <div class="category-documents">
                ${documents.map(doc => `
                    <div class="document-item ${isImportant ? 'important-doc' : ''}" data-doc='${JSON.stringify(doc)}'>
                        <div class="document-summary">
                            <div class="document-header">
                                <i class="${doc.icon}"></i>
                                <span class="document-title">${doc.title}</span>
                                <span class="document-date">${doc.date}</span>
                                ${doc.deadline ? `<span class="document-deadline">Deadline: ${doc.deadline}</span>` : ''}
                            </div>
                            <p class="document-summary-text">${doc.summary || doc.content.substring(0, 80) + '...'}</p>
                        </div>
                        <div class="document-details" style="display: none;">
                            <div class="document-full-content">
                                ${doc.preview ? `<img src="${doc.preview}" alt="Preview" class="document-preview-img">` : ''}
                                <p class="document-content">${doc.content}</p>
                            </div>
                            <div class="document-actions">
                                <button class="btn-view-all" onclick="event.stopPropagation(); openDocumentPopup(event, '${doc.title}', '${doc.fileLink || ''}', '${doc.content}')">
                                    <i class="fas fa-external-link-alt"></i> View All
                                </button>
                                ${doc.fileLink ? `<button class="btn-download" onclick="event.stopPropagation(); downloadFile('${doc.fileLink}')"><i class="fas fa-download"></i> Download</button>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getDepartmentDocuments(department) {
    const allDocs = {
        all: [
            {
                title: 'PDF Documents:',
                icon: 'fas fa-file-pdf',
                documents: {
                    important: [
                        { title: 'Annual Budget Report 2025', icon: 'fas fa-file-pdf', date: 'Jan 15, 2025', type: 'pdf', department: 'finance', content: 'The FY 2025 budget allocates ₹2,847 crores for metro expansion, including ₹1,200 crores for Phase III construction, ₹650 crores for rolling stock procurement, ₹400 crores for station infrastructure upgrades, and ₹597 crores for operational expenses. Key highlights include funding for 3 new lines covering 45 km, procurement of 24 additional train sets, implementation of advanced signaling systems, and establishment of integrated transport hubs. The budget also provisions ₹180 crores for sustainability initiatives including solar power integration and energy-efficient systems.', fileLink: 'annual_budget_2025.pdf', deadline: 'Jan 31, 2025', summary: 'FY 2025 budget allocates ₹2,847 crores for metro expansion with Phase III construction and new train procurement.' },
                        { title: 'Safety Protocol Manual', icon: 'fas fa-file-pdf', date: 'Jan 10, 2025', type: 'pdf', department: 'safety', content: 'Comprehensive safety manual covering emergency evacuation procedures, fire safety protocols, platform safety measures, train operation safety standards, and passenger security guidelines. Updated protocols include new COVID-19 safety measures, enhanced CCTV surveillance procedures, improved crowd management strategies during peak hours, emergency communication systems, and coordination protocols with local emergency services. All staff must complete mandatory training by January 20, 2025.', fileLink: 'safety_protocol_2025.pdf', deadline: 'Jan 20, 2025', summary: 'Updated safety manual with emergency procedures, COVID-19 protocols, and mandatory staff training by Jan 20.' }
                    ],
                    others: [
                        { title: 'Monthly Newsletter December 2024', icon: 'fas fa-file-pdf', date: 'Dec 28, 2024', type: 'pdf', department: 'hr', content: 'December newsletter featuring year-end achievements, employee recognition awards, upcoming training programs, policy updates, and New Year celebration plans. Includes ridership statistics showing 15% growth, infrastructure milestones, and community outreach initiatives.', fileLink: 'newsletter_dec_2024.pdf', summary: 'December newsletter with year-end achievements, 15% ridership growth, and employee recognition awards.' },
                        { title: 'New Employee Training Manual', icon: 'fas fa-file-pdf', date: 'Dec 20, 2024', type: 'pdf', department: 'hr', content: 'Complete training curriculum for new hires covering KMRL history, organizational structure, safety procedures, customer service standards, technical operations, and professional development pathways. Includes 40-hour training schedule spread over 2 weeks.', fileLink: 'training_materials.pdf', summary: 'Complete 40-hour training curriculum for new employees covering KMRL operations and safety procedures.' }
                    ]
                }
            },
            {
                title: 'Images & Media:',
                icon: 'fas fa-file-image',
                documents: {
                    important: [
                        { title: 'Station Infrastructure Assessment Photos', icon: 'fas fa-file-image', date: 'Jan 12, 2025', type: 'image', department: 'operations', content: 'Critical infrastructure assessment photos documenting structural integrity, platform conditions, escalator functionality, lighting systems, and accessibility features across all 34 operational stations. Photos include before/after renovation comparisons, safety compliance documentation, and areas requiring immediate attention. Essential for Phase III expansion planning and budget allocation decisions.', preview: 'img/2nd.jpg', fileLink: 'station_photos_2025.zip', deadline: 'Jan 25, 2025', summary: 'Infrastructure assessment photos of all 34 stations documenting structural integrity and safety compliance.' }
                    ],
                    others: [
                        { title: 'Annual Day Celebration Photos', icon: 'fas fa-file-image', date: 'Dec 15, 2024', type: 'image', department: 'admin', content: 'Photo collection from KMRL Annual Day 2024 celebration held at Kaloor Stadium, featuring cultural performances, employee recognition ceremony, achievement awards, and community participation events. Includes group photos of all departments and special moments from the day.', fileLink: 'event_photos_dec.zip', summary: 'Annual Day 2024 celebration photos from Kaloor Stadium with cultural performances and employee awards.' }
                    ]
                }
            },
            {
                title: 'Drawings:',
                icon: 'fas fa-drafting-compass',
                documents: {
                    important: [
                        { title: 'Kakkanad Extension Station Blueprint', icon: 'fas fa-drafting-compass', date: 'Jan 08, 2025', type: 'drawing', department: 'engineering', content: 'Critical architectural blueprints for the new Kakkanad Extension stations including InfoPark, Rajagiri, and Kakkanad Civil Station. Drawings include platform layouts, concourse designs, entry/exit configurations, parking facilities, and integration with existing infrastructure. Approval required for contractor bidding process scheduled for February 2025.', fileLink: 'station_blueprint_v2.dwg', deadline: 'Jan 30, 2025', summary: 'Architectural blueprints for Kakkanad Extension stations including InfoPark, Rajagiri, and Civil Station.' },
                        { title: 'Phase III Track Alignment Plan', icon: 'fas fa-drafting-compass', date: 'Jan 05, 2025', type: 'drawing', department: 'engineering', content: 'Detailed technical drawings for Phase III track alignment covering 11.2 km elevated corridor from JLN Stadium to Kakkanad. Includes gradient specifications, curve radii, support pillar locations, noise barrier placements, and environmental impact mitigation measures. Critical for land acquisition and construction timeline finalization.', fileLink: 'track_alignment.dwg', deadline: 'Jan 22, 2025', summary: 'Phase III track alignment drawings for 11.2 km elevated corridor from JLN Stadium to Kakkanad.' }
                    ],
                    others: [
                        { title: 'Traction Power System Schematic', icon: 'fas fa-drafting-compass', date: 'Dec 18, 2024', type: 'drawing', department: 'engineering', content: 'Comprehensive electrical system schematics for 750V DC traction power distribution across the network. Includes substation locations, overhead catenary system layouts, power feeding arrangements, and backup power configurations for all operational lines.', fileLink: 'electrical_schematic.dwg', summary: 'Electrical system schematics for 750V DC traction power distribution with substation and catenary layouts.' }
                    ]
                }
            }
        ],
        finance: [
            {
                title: 'Financial Documents:',
                icon: 'fas fa-file-pdf',
                documents: {
                    important: [
                        { title: 'Annual Budget 2025', icon: 'fas fa-file-pdf', date: 'Jan 15, 2025', type: 'pdf', department: 'finance', content: 'Critical annual budget requiring immediate approval.', fileLink: 'annual_budget_2025.pdf', deadline: 'Jan 31, 2025' },
                        { title: 'Tax Filing Documents', icon: 'fas fa-file-pdf', date: 'Jan 10, 2025', type: 'pdf', department: 'finance', content: 'Urgent tax documentation for quarterly filing.', fileLink: 'tax_filing_q4.pdf', deadline: 'Jan 25, 2025' }
                    ],
                    others: [
                        { title: 'Monthly Budget Report', icon: 'fas fa-file-pdf', date: 'Dec 15, 2024', type: 'pdf', department: 'finance', content: 'Detailed monthly budget analysis including revenue, expenses, and projections.', fileLink: 'monthly_budget_dec.pdf' },
                        { title: 'Invoice Processing Guidelines', icon: 'fas fa-file-pdf', date: 'Dec 10, 2024', type: 'pdf', department: 'finance', content: 'Standard operating procedures for invoice processing and approval workflows.', fileLink: 'invoice_guidelines.pdf' }
                    ]
                }
            },
            {
                title: 'Spreadsheets:',
                icon: 'fas fa-file-excel',
                documents: {
                    important: [
                        { title: 'Revenue Forecast 2025', icon: 'fas fa-file-excel', date: 'Jan 12, 2025', type: 'excel', department: 'finance', content: 'Critical revenue projections for 2025 planning.', fileLink: 'revenue_forecast_2025.xlsx', deadline: 'Jan 28, 2025' }
                    ],
                    others: [
                        { title: 'Expense Tracking Sheet', icon: 'fas fa-file-excel', date: 'Dec 20, 2024', type: 'excel', department: 'finance', content: 'Monthly expense tracking and categorization.', fileLink: 'expense_tracking.xlsx' }
                    ]
                }
            }
        ],
        operations: [
            {
                title: 'Operations Documents:',
                icon: 'fas fa-train',
                documents: {
                    important: [
                        { title: 'Emergency Response Plan', icon: 'fas fa-file-pdf', date: 'Jan 08, 2025', type: 'pdf', department: 'operations', content: 'Critical emergency response procedures requiring immediate implementation.', fileLink: 'emergency_response_2025.pdf', deadline: 'Jan 20, 2025' },
                        { title: 'Service Disruption Protocol', icon: 'fas fa-file-pdf', date: 'Jan 05, 2025', type: 'pdf', department: 'operations', content: 'Urgent protocols for handling service disruptions.', fileLink: 'service_disruption.pdf', deadline: 'Jan 18, 2025' }
                    ],
                    others: [
                        { title: 'Train Schedule Updates', icon: 'fas fa-file-pdf', date: 'Dec 10, 2024', type: 'pdf', department: 'operations', content: 'Latest updates to train schedules including new routes and timing adjustments.', fileLink: 'train_schedule_updates.pdf' },
                        { title: 'Station Maintenance Log', icon: 'fas fa-file-excel', date: 'Dec 08, 2024', type: 'excel', department: 'operations', content: 'Comprehensive maintenance log for all metro stations with scheduled and completed work.', fileLink: 'maintenance_log.xlsx' }
                    ]
                }
            },
            {
                title: 'Drawings:',
                icon: 'fas fa-drafting-compass',
                documents: {
                    important: [
                        { title: 'Platform Extension Blueprint', icon: 'fas fa-drafting-compass', date: 'Jan 10, 2025', type: 'drawing', department: 'operations', content: 'Critical blueprints for platform extension project.', fileLink: 'platform_extension.dwg', deadline: 'Jan 25, 2025' }
                    ],
                    others: [
                        { title: 'Signage Layout Plan', icon: 'fas fa-drafting-compass', date: 'Dec 15, 2024', type: 'drawing', department: 'operations', content: 'Layout plans for station signage updates.', fileLink: 'signage_layout.dwg' }
                    ]
                }
            }
        ],
        hr: [
            {
                title: 'HR Documents:',
                icon: 'fas fa-users',
                documents: {
                    important: [
                        { title: 'Policy Update 2025', icon: 'fas fa-file-pdf', date: 'Jan 12, 2025', type: 'pdf', department: 'hr', content: 'Critical policy updates requiring immediate implementation.', fileLink: 'policy_update_2025.pdf', deadline: 'Jan 30, 2025' },
                        { title: 'Compliance Training', icon: 'fas fa-file-pdf', date: 'Jan 08, 2025', type: 'pdf', department: 'hr', content: 'Mandatory compliance training materials with deadline.', fileLink: 'compliance_training.pdf', deadline: 'Jan 22, 2025' }
                    ],
                    others: [
                        { title: 'Employee Handbook 2025', icon: 'fas fa-file-pdf', date: 'Dec 15, 2024', type: 'pdf', department: 'hr', content: 'Updated employee handbook with policies, procedures, and benefits information.', fileLink: 'employee_handbook_2025.pdf' },
                        { title: 'Training Schedule', icon: 'fas fa-file-word', date: 'Dec 01, 2024', type: 'word', department: 'hr', content: 'Comprehensive training schedule for all departments including safety and technical training.', fileLink: 'training_schedule.docx' }
                    ]
                }
            },
            {
                title: 'Spreadsheets:',
                icon: 'fas fa-file-excel',
                documents: {
                    important: [
                        { title: 'Performance Reviews 2025', icon: 'fas fa-file-excel', date: 'Jan 15, 2025', type: 'excel', department: 'hr', content: 'Annual performance review data requiring immediate attention.', fileLink: 'performance_reviews_2025.xlsx', deadline: 'Feb 01, 2025' }
                    ],
                    others: [
                        { title: 'Attendance Records', icon: 'fas fa-file-excel', date: 'Dec 30, 2024', type: 'excel', department: 'hr', content: 'Monthly attendance tracking and analysis.', fileLink: 'attendance_records.xlsx' }
                    ]
                }
            }
        ],
        engineering: [
            {
                title: 'Drawings:',
                icon: 'fas fa-drafting-compass',
                documents: {
                    important: [
                        { title: 'New Line Construction Plan', icon: 'fas fa-drafting-compass', date: 'Jan 10, 2025', type: 'drawing', department: 'engineering', content: 'Critical construction plans for new metro line extension.', fileLink: 'new_line_construction.dwg', deadline: 'Feb 15, 2025' },
                        { title: 'Bridge Structural Design', icon: 'fas fa-drafting-compass', date: 'Jan 08, 2025', type: 'drawing', department: 'engineering', content: 'Urgent structural designs for bridge construction.', fileLink: 'bridge_structural.dwg', deadline: 'Jan 30, 2025' }
                    ],
                    others: [
                        { title: 'Electrical Schematic', icon: 'fas fa-drafting-compass', date: 'Dec 18, 2024', type: 'drawing', department: 'engineering', content: 'Electrical system schematics for station power distribution.', fileLink: 'electrical_schematic.dwg' },
                        { title: 'Ventilation System Plan', icon: 'fas fa-drafting-compass', date: 'Dec 12, 2024', type: 'drawing', department: 'engineering', content: 'HVAC and ventilation system layouts.', fileLink: 'ventilation_plan.dwg' }
                    ]
                }
            },
            {
                title: 'Technical Documents:',
                icon: 'fas fa-file-alt',
                documents: {
                    important: [
                        { title: 'Safety Assessment Report', icon: 'fas fa-file-alt', date: 'Jan 12, 2025', type: 'pdf', department: 'engineering', content: 'Critical safety assessment requiring immediate review.', fileLink: 'safety_assessment.pdf', deadline: 'Jan 25, 2025' }
                    ],
                    others: [
                        { title: 'Material Specifications', icon: 'fas fa-file-alt', date: 'Dec 20, 2024', type: 'pdf', department: 'engineering', content: 'Technical specifications for construction materials.', fileLink: 'material_specs.pdf' }
                    ]
                }
            }
        ]
    };
    
    return allDocs[department] || allDocs.all;
}

function toggleDocumentExpansion(documentItem) {
    const documentDetails = documentItem.querySelector('.document-details');
    const documentSummaryText = documentItem.querySelector('.document-summary-text');
    const isExpanded = documentItem.classList.contains('expanded');
    
    if (isExpanded) {
        documentItem.classList.remove('expanded');
        documentDetails.style.display = 'none';
        documentSummaryText.style.display = 'block';
    } else {
        documentItem.classList.add('expanded');
        documentDetails.style.display = 'block';
        documentSummaryText.style.display = 'none';
    }
}

function openDocumentPopup(event, title, fileLink, content) {
    if (event) event.stopPropagation(); // Prevent document expansion when clicking button
    
    const popup = document.createElement('div');
    popup.className = 'document-popup-overlay';
    popup.innerHTML = `
        <div class="document-popup">
            <div class="popup-header">
                <h3>${title}</h3>
                <button class="popup-close" onclick="closeDocumentPopup()">&times;</button>
            </div>
            <div class="popup-content">
                <p>${content}</p>
                ${fileLink ? `
                    <div class="popup-file-link">
                        <h4>Original Document:</h4>
                        <a href="#" onclick="downloadFile('${fileLink}')" class="file-download-link">
                            <i class="fas fa-file"></i> ${fileLink}
                        </a>
                    </div>
                ` : ''}
            </div>
            <div class="popup-actions">
                ${fileLink ? `<button class="btn-download" onclick="downloadFile('${fileLink}')"><i class="fas fa-download"></i> Download</button>` : ''}
                <button class="btn-close" onclick="closeDocumentPopup()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    popup.style.display = 'flex';
}

function closeDocumentPopup() {
    const popup = document.querySelector('.document-popup-overlay');
    if (popup) {
        popup.remove();
    }
}

function downloadFile(fileName) {
    showNotification(`Downloading ${fileName}...`, 'info');
    // In a real application, this would trigger an actual file download
    setTimeout(() => {
        showNotification(`${fileName} downloaded successfully!`, 'success');
    }, 1500);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#35b6b9',
        warning: '#ff9800'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
    
    // Add slide-out animation
    style.textContent += `
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
}
