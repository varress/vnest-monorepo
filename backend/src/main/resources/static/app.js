// app.js
const API_BASE = '/api';
const ADMIN_BASE = '/admin';
let currentEditId = null;
let allGroups = [];
let allWords = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadGroups();
    loadWords();
});

// Load all groups
async function loadGroups() {
    try {
        const response = await fetch(`${ADMIN_BASE}/words/groups`);
        const result = await response.json();

        if (result.success && result.data) {
            allGroups = result.data;
            populateGroupSelects();
        }
    } catch (error) {
        showAlert('Failed to load groups: ' + error.message, 'error');
    }
}

// Populate all group dropdowns
function populateGroupSelects() {
    const selects = ['word-group', 'edit-word-group'];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select group...</option>';
            allGroups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.name;
                select.appendChild(option);
            });
        }
    });
}

// Toggle group field visibility based on word type
function toggleGroupField(selectId) {
    const typeSelect = selectId === 'word-group' ?
        document.getElementById('word-type') :
        document.getElementById('edit-word-type');

    const containerId = selectId === 'word-group' ?
        'word-group-container' :
        'edit-word-group-container';

    const container = document.getElementById(containerId);

    if (typeSelect && typeSelect.value === 'VERB') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        const groupSelect = document.getElementById(selectId);
        if (groupSelect) {
            groupSelect.value = '';
        }
    }
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');

    if (tab === 'words') {
        loadWords();
    } else if (tab === 'combinations') {
        loadCombinations();
        loadVerbsForCombos();
    } else if (tab === 'themes') {
        loadThemes();
    }
}

// Alert messages
function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}

// Words Management
async function loadWords() {
    const type = document.getElementById('word-filter').value;
    const url = type ? `${API_BASE}/words?type=${type}` : `${API_BASE}/words`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.data) {
            allWords = result.data;
            displayWords(result.data);
        }
    } catch (error) {
        showAlert('Failed to load words: ' + error.message, 'error');
    }
}

function displayWords(words) {
    const container = document.getElementById('words-list');

    if (words.length === 0) {
        container.innerHTML = '<div class="empty-state">No words found</div>';
        return;
    }

    const table = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Text</th>
                    <th>Type</th>
                    <th>Group</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${words.map(word => `
                    <tr>
                        <td>${word.id}</td>
                        <td>${escapeHtml(word.text)}</td>
                        <td><span class="badge badge-${word.type.toLowerCase()}">${word.type}</span></td>
                        <td>${word.type === 'VERB' && word.groupName ? escapeHtml(word.groupName) : '-'}</td>
                        <td class="actions">
                            <button class="btn btn-primary btn-small" onclick="openEditWordModal(${word.id})">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteWord(${word.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create word form handler
document.getElementById('word-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = document.getElementById('word-text').value.trim();
    const type = document.getElementById('word-type').value;
    const groupId = document.getElementById('word-group').value;

    const data = { text, type };

    // Only include groupId for VERB types
    if (type === 'VERB' && groupId) {
        data.group_id = parseInt(groupId);
    }

    try {
        const response = await fetch(`${ADMIN_BASE}/words`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Word created successfully!');
            e.target.reset();
            document.getElementById('word-group-container').style.display = 'none';
            loadWords();
        } else {
            showAlert('Failed to create word', 'error');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

// Open edit word modal
function openEditWordModal(wordId) {
    const word = allWords.find(w => w.id === wordId);
    if (!word) return;

    document.getElementById('edit-word-id').value = word.id;
    document.getElementById('edit-word-text').value = word.text;
    document.getElementById('edit-word-type').value = word.type;

    // Show/hide group field based on word type
    const groupContainer = document.getElementById('edit-word-group-container');
    if (word.type === 'VERB') {
        groupContainer.style.display = 'block';
        document.getElementById('edit-word-group').value = word.groupId || '';
    } else {
        groupContainer.style.display = 'none';
    }

    document.getElementById('edit-word-modal').style.display = 'block';
}

// Close edit word modal
function closeEditWordModal() {
    const modal = document.getElementById('edit-word-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    const form = document.getElementById('edit-word-form');
    if (form) {
        form.reset();
    }
}

// Update word form handler
document.getElementById('edit-word-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-word-id').value;
    const text = document.getElementById('edit-word-text').value.trim();
    const type = document.getElementById('edit-word-type').value;
    const groupId = document.getElementById('edit-word-group').value;

    const data = { text, type };

    // Only include groupId for VERB types
    if (type === 'VERB' && groupId) {
        data.group_id = parseInt(groupId);
    }

    try {
        const response = await fetch(`${ADMIN_BASE}/words/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Word updated successfully!');
            closeEditWordModal();
            loadWords();
        } else {
            showAlert('Failed to update word', 'error');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

async function deleteWord(id) {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
        const response = await fetch(`${ADMIN_BASE}/words/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Word deleted successfully!');
            loadWords();
        } else {
            showAlert('Failed to delete word', 'error');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

// Combinations Management
async function loadVerbsForCombos() {
    try {
        // Load verbs, subjects, and objects
        const verbs = await (await fetch(`${API_BASE}/words?type=VERB`)).json();
        const subjects = await (await fetch(`${API_BASE}/words?type=SUBJECT`)).json();
        const objects = await (await fetch(`${API_BASE}/words?type=OBJECT`)).json();

        // Populate verbs
        if (verbs.success && verbs.data) {
            const options = verbs.data.map(v => `<option value="${v.id}">${v.text}</option>`).join('');
            ['combo-verb', 'batch-verb', 'combo-filter'].forEach(id => {
                const sel = document.getElementById(id);
                sel.innerHTML = id === 'combo-filter'
                    ? `<option value="">All Verbs</option>${options}`
                    : `<option value="">Select verb...</option>${options}`;
            });
        }

        // Populate subjects
        if (subjects.success && subjects.data) {
            const subjectOptions = subjects.data.map(s => `<option value="${s.id}">${s.text}</option>`).join('');
            document.getElementById('combo-subject').innerHTML = `<option value="">Select subject...</option>${subjectOptions}`;
            document.getElementById('batch-subjects').innerHTML = subjectOptions;
        }

        // Populate objects
        if (objects.success && objects.data) {
            const objectOptions = objects.data.map(o => `<option value="${o.id}">${o.text}</option>`).join('');
            document.getElementById('combo-object').innerHTML = `<option value="">Select object...</option>${objectOptions}`;
            document.getElementById('batch-objects').innerHTML = objectOptions;
        }
    } catch (error) {
        showAlert('Failed to load options: ' + error.message, 'error');
    }
}

async function loadCombinations() {
    const verbId = document.getElementById('combo-filter').value;
    const url = verbId ? `${API_BASE}/combinations?verb_id=${verbId}` : `${API_BASE}/combinations`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.data) {
            displayCombinations(result.data);
        }
    } catch (error) {
        showAlert('Failed to load combinations: ' + error.message, 'error');
    }
}

function logout() {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }).then(() => {
        window.location.href = '/login.html';
    });
}

function displayCombinations(combinations) {
    const container = document.getElementById('combinations-list');

    if (combinations.length === 0) {
        container.innerHTML = '<div class="empty-state">No combinations found</div>';
        return;
    }

    const table = `
        <table>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Verb</th>
                    <th>Object</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${combinations.map(combo => `
                    <tr>
                        <td>${combo.subject.text} (${combo.subject.id})</td>
                        <td>${combo.verb.text} (${combo.verb.id})</td>
                        <td>${combo.object.text} (${combo.object.id})</td>
                        <td class="actions">
                            <button class="btn btn-danger" onclick="deleteCombination(${combo.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

document.getElementById('combination-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const objectId = document.getElementById('combo-object').value;

    const data = {
        verb_id: parseInt(document.getElementById('combo-verb').value),
        subject_id: parseInt(document.getElementById('combo-subject').value),
        object_id: objectId ? parseInt(objectId) : null
    };

    try {
        const response = await fetch(`${ADMIN_BASE}/combinations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Combination created successfully!');
            e.target.reset();
            loadCombinations();
        } else {
            showAlert('Failed to create combination', 'error');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

async function createBatchCombinations() {
    const verbId = document.getElementById('batch-verb').value;
    const subjectSelect = document.getElementById('batch-subjects');
    const objectSelect = document.getElementById('batch-objects');

    const subjectIds = Array.from(subjectSelect.selectedOptions).map(opt => parseInt(opt.value));
    const objectIds = Array.from(objectSelect.selectedOptions).map(opt => parseInt(opt.value));

    if (!verbId || subjectIds.length === 0) {
        showAlert('Please select at least one subject and a verb.', 'error');
        return;
    }

    const data = {
        verb_id: parseInt(verbId),
        subject_ids: subjectIds,
        object_ids: objectIds
    };

    try {
        const response = await fetch(`${ADMIN_BASE}/combinations/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showAlert(`Successfully created ${result.data.count} combinations!`);
            loadCombinations();
        } else {
            showAlert('Failed to create batch combinations', 'error');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

async function deleteCombination(id) {
    if (!confirm('Are you sure you want to delete this combination?')) return;

    try {
        const response = await fetch(`${ADMIN_BASE}/combinations/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Combination deleted successfully!');
            loadCombinations();
        } else {
            showAlert('Failed to delete combination', 'error');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

// Themes Management
async function loadThemes() {
    try {
        const response = await fetch(`${ADMIN_BASE}/words/groups`);
        const result = await response.json();

        if (result.success && result.data) {
            displayThemes(result.data);
        }
    } catch (error) {
        showAlert('Failed to load themes: ' + error.message, 'error');
    }
}

function displayThemes(themes) {
    const container = document.getElementById('themes-list');

    if (themes.length === 0) {
        container.innerHTML = '<div class="empty-state">No themes found</div>';
        return;
    }

    const table = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${themes.map(theme => `
                    <tr>
                        <td>${theme.id}</td>
                        <td>${escapeHtml(theme.name)}</td>
                        <td>${theme.description ? escapeHtml(theme.description) : '-'}</td>
                        <td class="actions">
                            <button class="btn btn-primary btn-small" onclick="openEditThemeModal(${theme.id})">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteTheme(${theme.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Create theme form handler
document.getElementById('theme-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('theme-name').value.trim();
    const description = document.getElementById('theme-description').value.trim();

    const data = { name };
    if (description) {
        data.description = description;
    }

    try {
        const response = await fetch(`${ADMIN_BASE}/words/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Theme created successfully!');
            e.target.reset();
            loadThemes();
            loadGroups(); // Refresh groups for word dropdowns
        } else {
            showAlert('Failed to create theme', 'error');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

// Open edit theme modal
function openEditThemeModal(themeId) {
    const theme = allGroups.find(g => g.id === themeId);
    if (!theme) {
        showAlert('Theme not found', 'error');
        return;
    }

    document.getElementById('edit-theme-id').value = theme.id;
    document.getElementById('edit-theme-name').value = theme.name;
    document.getElementById('edit-theme-description').value = theme.description || '';

    document.getElementById('edit-theme-modal').style.display = 'flex';
}

// Update theme form handler
document.getElementById('edit-theme-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-theme-id').value;
    const name = document.getElementById('edit-theme-name').value.trim();
    const description = document.getElementById('edit-theme-description').value.trim();

    const data = { name };
    if (description) {
        data.description = description;
    }

    try {
        const response = await fetch(`${ADMIN_BASE}/words/groups/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Theme updated successfully!');
            closeEditThemeModal();
            loadThemes();
            loadGroups(); // Refresh groups for word dropdowns
        } else {
            showAlert('Failed to update theme', 'error');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
});

async function deleteTheme(id) {
    if (!confirm('Are you sure you want to delete this theme? This may affect verbs using this theme.')) return;

    try {
        const response = await fetch(`${ADMIN_BASE}/words/groups/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Theme deleted successfully!');
            loadThemes();
            loadGroups(); // Refresh groups for word dropdowns
        } else {
            const result = await response.json();
            showAlert('Failed to delete theme. It may be in use by verbs.', 'error');
        }
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

// Close edit theme modal
function closeEditThemeModal() {
    const modal = document.getElementById('edit-theme-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    const form = document.getElementById('edit-theme-form');
    if (form) {
        form.reset();
    }
}