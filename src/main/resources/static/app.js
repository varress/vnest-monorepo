// app.js
const API_BASE = '/api';
const ADMIN_BASE = '/admin'
let currentEditId = null;

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
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${words.map(word => `
                    <tr>
                        <td>${word.id}</td>
                        <td>${word.text}</td>
                        <td>${word.type}</td>
                        <td class="actions">
                            <button class="btn btn-danger" onclick="deleteWord(${word.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

document.getElementById('word-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        text: document.getElementById('word-text').value,
        type: document.getElementById('word-type').value,
    };

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
            loadWords();
        } else {
            showAlert('Failed to create word', 'error');
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
                    <th>Object</th>
                    <th>Verb</th>
                    <th>Subject</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${combinations.map(combo => `
                    <tr>
                        <td>${combo.subject.text} (${combo.subject.id})</td>
                        <td>${combo.verb.text} (${combo.verb.id})</td>
                        <td>${combo.object.text} (${combo.object.id})}</td>
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

// Initialize
loadWords();
