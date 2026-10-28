// Prestations du salon adaptées pour Dakar (Sénégal) - Tarifs en FCFA
const services = [
    { 
        id: 'micro', 
        name: 'Micro locks', 
        category: 'Création', 
        price: '30 000 FCFA', 
        duration: '4 – 6 h', 
        description: 'Départ ou retwist très fin et précis, idéal pour une chevelure dense et élégante.', 
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' 
    },
    { 
        id: 'sister', 
        name: 'Sister locks', 
        category: 'Création', 
        price: '50 000 FCFA', 
        duration: '5 – 8 h', 
        description: 'Technique sur-mesure ultra fine exécutée avec soin et précision.', 
        image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80' 
    },
    { 
        id: 'detox', 
        name: 'Soins Détox & Hydratation', 
        category: 'Soins', 
        price: '10 000 FCFA', 
        duration: '1 h 30 min', 
        description: 'Bain nettoyant profond au bicarbonate et vinaigre de cidre avec hydratation du cuir chevelu.', 
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80' 
    },
    { 
        id: 'barrel', 
        name: 'Barrel TWISTE', 
        category: 'Style', 
        price: '3 500 FCFA', 
        duration: '45 min', 
        description: 'Coiffure protectrice stylisée et torsadée sur vos locks.', 
        image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80' 
    },
    { 
        id: 'retwist', 
        name: 'Retwist & Reprise de racine', 
        category: 'Entretien', 
        price: 'Sur devis', 
        duration: '2 – 3 h', 
        description: 'Entretien minutieux des repousses et resserrage des racines selon la longueur.', 
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' 
    },
    { 
        id: 'reparation', 
        name: 'Réparation de locks', 
        category: 'Réparation', 
        price: 'Sur devis', 
        duration: 'Variable', 
        description: 'Restauration de locks abîmées, affaiblies ou cassées.', 
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' 
    },
    { 
        id: 'extensions', 
        name: "Pose d'extensions", 
        category: 'Création', 
        price: 'Sur devis', 
        duration: 'Variable', 
        description: "Tarif selon la taille, le style (Micro/Sister) et si vous fournissez ou non les extensions.", 
        image: 'https://images.unsplash.com/photo-1584297091622-f0efd7a12668?auto=format&fit=crop&w=600&q=80' 
    }
];

// Créneaux adaptés aux prestations longues à domicile (~3h par RDV)
const timeSlots = ['09:00', '14:00'];

// Horaires d'intervention (0 = dimanche) - Ouvert 7j/7 de 09h à 19h
const openingHours = [
    { day: 'Dimanche', open: 9, close: 19 },
    { day: 'Lundi', open: 9, close: 19 },
    { day: 'Mardi', open: 9, close: 19 },
    { day: 'Mercredi', open: 9, close: 19 },
    { day: 'Jeudi', open: 9, close: 19 },
    { day: 'Vendredi', open: 9, close: 19 },
    { day: 'Samedi', open: 9, close: 19 }
];

const statuses = [
    { label: 'Nouveau RDV', cls: 'status-new' },
    { label: 'En attente', cls: 'status-pending' },
    { label: 'Confirmé', cls: 'status-confirmed' },
    { label: 'Terminé', cls: 'status-done' }
];

// Base de données initiale
let clientsData = [
    { name: "Sofia", phone: "+221 77 123 45 67", service: "Micro locks", date: "2026-03-05", time: "09:00", notes: "Sakar, Dakar", status: "Confirmé" }
];

let catalogueFilter = 'Tout';
let adminStatusFilter = 'Tous';
let selectedSlot = null;

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toasts');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

let adminUnlocked = false;
let currentSection = 'home';

const menuGroups = [
    {
        title: 'Navigation',
        items: [
            { label: 'Accueil', icon: '🏠', section: 'home' },
            { label: 'Styles & Tarifs', icon: '✂️', section: 'catalogue', badge: () => services.length },
            { label: 'Réserver à domicile', icon: '📅', section: 'booking' }
        ]
    },
    {
        title: 'Espace Salon',
        items: [
            { label: 'Espace Salon (Interne)', icon: '🔒', action: openPinModal, visible: () => !adminUnlocked },
            { label: 'Fiches Clients & RDV', icon: '📋', section: 'admin', visible: () => adminUnlocked, badge: () => clientsData.filter(c => c.status === 'Nouveau RDV').length || null },
            { label: 'Verrouiller', icon: '🚪', action: lockAdmin, danger: true, visible: () => adminUnlocked }
        ]
    }
];

function renderMenu() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    nav.innerHTML = '';

    menuGroups.forEach(group => {
        const items = group.items.filter(item => !item.visible || item.visible());
        if (items.length === 0) return;

        const title = document.createElement('div');
        title.className = 'sidebar-group-title';
        title.textContent = group.title;
        nav.appendChild(title);

        const list = document.createElement('ul');
        list.className = 'sidebar-menu';

        items.forEach(item => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = 'nav-link';
            if (item.danger) btn.classList.add('danger');
            if (item.section && item.section === currentSection) btn.classList.add('active');
            btn.innerHTML = `<span class="icon">${item.icon}</span><span></span>`;
            btn.lastChild.textContent = item.label;
            const badge = item.badge && item.badge();
            if (badge) {
                const b = document.createElement('span');
                b.className = 'badge';
                b.textContent = badge;
                btn.appendChild(b);
            }
            btn.addEventListener('click', () => {
                closeSidebar();
                if (item.action) item.action();
                else switchSection(item.section);
            });
            li.appendChild(btn);
            list.appendChild(li);
        });

        nav.appendChild(list);
    });
}

function openSidebar() {
    renderMenu();
    document.getElementById('sidebar')?.classList.add('open');
    document.getElementById('sidebar')?.setAttribute('aria-hidden', 'false');
    document.getElementById('sidebarOverlay')?.classList.add('open');
    document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar')?.setAttribute('aria-hidden', 'true');
    document.getElementById('sidebarOverlay')?.classList.remove('open');
    document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeSidebar();
        closePinModal();
    }
});

function switchSection(sectionId) {
    if (sectionId === 'admin' && !adminUnlocked) {
        openPinModal();
        return;
    }
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
    currentSection = sectionId;
    renderMenu();
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function lockAdmin() {
    adminUnlocked = false;
    switchSection('home');
    showToast('Espace salon verrouillé.');
}

// Catalogue généré dynamiquement
function renderCatalogue() {
    const categories = ['Tout', ...new Set(services.map(s => s.category))];
    const filters = document.getElementById('catalogueFilters');
    if (filters) {
        filters.innerHTML = '';
        categories.forEach(cat => {
            const chip = document.createElement('button');
            chip.className = 'chip' + (cat === catalogueFilter ? ' active' : '');
            chip.textContent = cat;
            chip.onclick = () => { catalogueFilter = cat; renderCatalogue(); };
            filters.appendChild(chip);
        });
    }

    const grid = document.getElementById('catalogueGrid');
    if (!grid) return;
    grid.innerHTML = '';
    services
        .filter(s => catalogueFilter === 'Tout' || s.category === catalogueFilter)
        .forEach((s, i) => {
            const card = document.createElement('article');
            card.className = 'card';
            card.style.animationDelay = `${i * 0.07}s`;
            card.innerHTML = `
                <div class="card-media">
                    <img src="${s.image}" alt="${escapeHtml(s.name)}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1584297091622-f0efd7a12668?auto=format&fit=crop&w=600&q=80'">
                    <span class="card-tag">${escapeHtml(s.category)}</span>
                </div>
                <div class="card-content">
                    <h3>${escapeHtml(s.name)}</h3>
                    <p>${escapeHtml(s.description)}</p>
                    <div class="card-meta">
                        <span class="duration">⏱ ${escapeHtml(s.duration)}</span>
                        <span class="price">${escapeHtml(s.price)}</span>
                    </div>
                    <button class="card-book">Réserver à domicile</button>
                </div>`;
            card.querySelector('.card-book').onclick = () => bookService(s.id);
            grid.appendChild(card);
        });
}

function bookService(serviceId) {
    const input = document.querySelector(`input[name="service"][value="${serviceId}"]`);
    if (input) {
        input.checked = true;
        toggleQuoteSection(serviceId);
    }
    switchSection('booking');
}

// Formulaire de réservation à domicile
function renderBookingForm() {
    const picker = document.getElementById('servicePicker');
    if (picker) {
        picker.innerHTML = services.map(s => `
            <label class="service-option" style="display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:8px; border:1px solid rgba(255,255,255,0.1); border-radius:6px; cursor:pointer;">
                <span>
                    <input type="radio" name="service" value="${s.id}" onchange="toggleQuoteSection('${s.id}')">
                    <strong>${escapeHtml(s.name)}</strong>
                </span>
                <small style="color:var(--accent); font-weight:bold;">${escapeHtml(s.price)}</small>
            </label>`).join('');
    }

    const slots = document.getElementById('slotPicker');
    if (slots) {
        slots.innerHTML = '';
        timeSlots.forEach(t => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chip';
            chip.textContent = t === '09:00' ? 'Matin (09h00)' : 'Après-midi (14h00)';
            chip.onclick = () => {
                selectedSlot = t;
                slots.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
                document.getElementById('slotGroup')?.classList.remove('invalid');
            };
            slots.appendChild(chip);
        });
    }

    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const dateInput = document.getElementById('clientDate');
    if (dateInput) {
        dateInput.min = today.toISOString().split('T')[0];
    }
}

function toggleQuoteSection(serviceId) {
    const quoteSec = document.getElementById('quoteSection');
    if (quoteSec) {
        if (['extensions', 'reparation', 'retwist'].includes(serviceId)) {
            quoteSec.style.display = 'block';
        } else {
            quoteSec.style.display = 'none';
        }
    }
}

function setInvalid(el, invalid) {
    if (!el) return true;
    el.closest('.form-group')?.classList.toggle('invalid', invalid);
    return !invalid;
}

// Validation et redirection WhatsApp
function handleBooking(event) {
    event.preventDefault();
    const nameEl = document.getElementById('clientName');
    const phoneEl = document.getElementById('clientPhone');
    const addressEl = document.getElementById('clientAddress');
    const dateEl = document.getElementById('clientDate');
    const serviceEl = document.querySelector('input[name="service"]:checked');
    const notesEl = document.getElementById('clientNotes');

    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const address = addressEl ? addressEl.value.trim() : '';
    const date = dateEl ? dateEl.value : '';

    let ok = true;
    ok = setInvalid(nameEl, name.length < 2) && ok;
    ok = setInvalid(phoneEl, phone.length < 6) && ok;
    ok = setInvalid(addressEl, address.length < 3) && ok;
    ok = setInvalid(document.getElementById('servicePicker'), !serviceEl) && ok;
    ok = setInvalid(dateEl, !date) && ok;
    ok = setInvalid(document.getElementById('slotPicker'), !selectedSlot) && ok;

    if (!ok) {
        showToast('Merci de remplir tous les champs obligatoires.', 'error');
        return;
    }

    const selectedServiceObj = services.find(s => s.id === serviceEl.value);
    const serviceName = selectedServiceObj ? selectedServiceObj.name : 'Prestation';
    const servicePrice = selectedServiceObj ? selectedServiceObj.price : '';

    // Enregistrement local dans l'espace admin
    clientsData.push({ 
        name, 
        phone, 
        service: serviceName, 
        date, 
        time: selectedSlot, 
        notes: `Adresse: ${address}` + (notesEl && notesEl.value ? ` | ${notesEl.value.trim()}` : ''), 
        status: "Nouveau RDV" 
    });

    // Construction du message WhatsApp
    let message = `*RÉSERVATION À DOMICILE - DREADLOCKS DAKAR*\n\n`;
    message += `👤 *Client :* ${name}\n`;
    message += `📞 *Téléphone :* ${phone}\n`;
    message += `📍 *Adresse / Quartier :* ${address}\n`;
    message += `💇‍♀️ *Prestation :* ${serviceName} (${servicePrice})\n`;
    message += `📅 *Date :* ${formatDate(date)}\n`;
    message += `⏰ *Créneau :* ${selectedSlot === '09:00' ? 'Matin (09h00)' : 'Après-midi (14h00)'}\n`;

    if (notesEl && notesEl.value.trim()) {
        message += `📝 *Notes :* ${notesEl.value.trim()}\n`;
    }

    if (['extensions', 'reparation', 'retwist'].includes(serviceEl.value)) {
        message += `\n📌 *Demande de devis :* Je vous envoie ci-après la photo de mes cheveux pour préciser le tarif.`;
    }

    // Redirection WhatsApp
    const whatsappPhone = "221784592249";
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

    showToast('Redirection vers WhatsApp...', 'success');
    
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        document.getElementById('bookingForm')?.reset();
        selectedSlot = null;
        document.querySelectorAll('#slotPicker .chip').forEach(c => c.classList.remove('active'));
        switchSection('home');
    }, 800);
}

// Gestion PIN Admin
function openPinModal() {
    const pinInput = document.getElementById('pinInput');
    if (pinInput) pinInput.value = '';
    const pinErr = document.getElementById('pinError');
    if (pinErr) pinErr.style.display = 'none';
    document.getElementById('pinModal')?.classList.add('open');
    setTimeout(() => pinInput?.focus(), 100);
}

function closePinModal() {
    document.getElementById('pinModal')?.classList.remove('open');
}

document.getElementById('pinInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') verifyPin();
});

function verifyPin() {
    const pinInput = document.getElementById('pinInput');
    if (pinInput && pinInput.value === "1234") {
        adminUnlocked = true;
        closePinModal();
        renderAdminTable();
        switchSection('admin');
        showToast('Bienvenue dans l’espace interne du salon.', 'success');
    } else {
        const pinErr = document.getElementById('pinError');
        if (pinErr) pinErr.style.display = 'block';
    }
}

// Interface d'administration
function renderAdminStats() {
    const statsEl = document.getElementById('adminStats');
    if (!statsEl) return;
    const stats = [
        { label: 'Total fiches', value: clientsData.length },
        { label: 'Nouveaux RDV', value: clientsData.filter(c => c.status === 'Nouveau RDV').length, highlight: true },
        { label: 'Confirmés', value: clientsData.filter(c => c.status === 'Confirmé').length }
    ];
    statsEl.innerHTML = stats.map(s =>
        `<div class="stat${s.highlight ? ' highlight' : ''}"><span>${s.label}</span><strong>${s.value}</strong></div>`
    ).join('');

    const filters = document.getElementById('statusFilters');
    if (filters) {
        filters.innerHTML = '';
        ['Tous', ...statuses.map(s => s.label)].forEach(label => {
            const chip = document.createElement('button');
            chip.className = 'chip' + (label === adminStatusFilter ? ' active' : '');
            chip.textContent = label;
            chip.onclick = () => { adminStatusFilter = label; renderAdminTable(); };
            filters.appendChild(chip);
        });
    }
}

function renderAdminTable() {
    renderAdminStats();
    const searchEl = document.getElementById('adminSearch');
    const query = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;

    const rows = clientsData
        .map((client, index) => ({ client, index }))
        .filter(({ client }) => adminStatusFilter === 'Tous' || client.status === adminStatusFilter)
        .filter(({ client }) => !query || `${client.name} ${client.phone} ${client.service}`.toLowerCase().includes(query))
        .sort((a, b) => (a.client.date + (a.client.time || '')).localeCompare(b.client.date + (b.client.time || '')));

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><span class="big">🌿</span>Aucune réservation enregistrée.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(({ client, index }) => {
        const status = statuses.find(s => s.label === client.status) || statuses[0];
        const options = statuses.map(s => `<option ${s.label === client.status ? 'selected' : ''}>${s.label}</option>`).join('');
        return `
            <tr>
                <td>
                    <div class="client-cell">
                        <span class="avatar">${escapeHtml(client.name.charAt(0).toUpperCase())}</span>
                        <div><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.phone)}</small></div>
                    </div>
                </td>
                <td>${escapeHtml(client.service)}${client.notes ? `<small style="display:block;color:var(--text-muted);">\${escapeHtml(client.notes)}</small>` : ''}</td>
                <td>${escapeHtml(formatDate(client.date))}<small style="display:block;color:var(--text-muted);">${client.time === '09:00' ? 'Matin (09h)' : 'Aprem (14h)'}</small></td>
                <td><select class="status-select ${status.cls}" onchange="updateStatus(${index}, this.value)">${options}</select></td>
                <td><button class="icon-btn" onclick="deleteClient(${index})">🗑</button></td>
            </tr>`;
    }).join('');
}

function updateStatus(index, value) {
    clientsData[index].status = value;
    renderAdminTable();
    renderMenu();
    showToast(`Statut mis à jour : ${value}`);
}

function deleteClient(index) {
    if (confirm("Voulez-vous supprimer cette fiche client ?")) {
        clientsData.splice(index, 1);
        renderAdminTable