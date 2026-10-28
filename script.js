  
        // Prestations du salon : utilisées pour le catalogue ET le formulaire
        const services = [
            { id: 'depart', name: 'Départ de Locks', category: 'Création', price: 'À partir de 600 DH', duration: '4 – 6 h', description: 'Technique douce au crochet ou torsion pour un démarrage parfait et durable.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
            { id: 'retwist', name: 'Retwist & Reprise de racine', category: 'Entretien', price: 'À partir de 300 DH', duration: '2 – 3 h', description: 'Entretien minutieux des repousses et resserrage pour un rendu impeccable.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
            { id: 'reparation', name: 'Réparation de locks', category: 'Réparation', price: 'Sur devis', duration: 'Variable', description: 'Restauration de locks abîmées, amincies ou cassées, sans perte de longueur.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
            { id: 'extensions', name: "Pose d'extensions", category: 'Création', price: 'Sur devis', duration: '5 – 8 h', description: "Ajout d'extensions en cheveux naturels pour gagner instantanément en longueur.", image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80' },
            { id: 'soin', name: 'Soin détox & hydratation', category: 'Entretien', price: '200 DH', duration: '1 h', description: 'Nettoyage en profondeur, élimination des résidus et hydratation du cuir chevelu.', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80' },
            { id: 'coiffage', name: 'Coiffage & attaches', category: 'Style', price: 'À partir de 150 DH', duration: '45 min', description: 'Chignons, tresses de locks et coiffures pour vos événements.', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80' }
        ];

        const timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

        // Horaires (0 = dimanche)
        const openingHours = [
            { day: 'Dimanche', open: 11, close: 16 },
            { day: 'Lundi', open: null, close: null },
            { day: 'Mardi', open: 10, close: 19 },
            { day: 'Mercredi', open: 10, close: 19 },
            { day: 'Jeudi', open: 10, close: 19 },
            { day: 'Vendredi', open: 10, close: 19 },
            { day: 'Samedi', open: 10, close: 19 }
        ];

        const statuses = [
            { label: 'Nouveau RDV', cls: 'status-new' },
            { label: 'En attente', cls: 'status-pending' },
            { label: 'Confirmé', cls: 'status-confirmed' },
            { label: 'Terminé', cls: 'status-done' }
        ];

        // Base de données initiale des clients du salon
        let clientsData = [
            { name: "Karim Benjelloun", phone: "06 12 34 56 78", service: "Retwist & Reprise de racine", date: "2026-03-05", time: "11:30", status: "Confirmé" },
            { name: "Aïcha Diallo", phone: "06 98 76 54 32", service: "Départ de Locks", date: "2026-03-06", time: "10:00", status: "En attente" }
        ];

        let catalogueFilter = 'Tout';
        let adminStatusFilter = 'Tous';
        let selectedSlot = null;

        function escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        }

        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            document.getElementById('toasts').appendChild(toast);
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

        // Configuration du menu latéral : les entrées sont générées dynamiquement
        let adminUnlocked = false;
        let currentSection = 'home';

        const menuGroups = [
            {
                title: 'Navigation',
                items: [
                    { label: 'Accueil', icon: '🏠', section: 'home' },
                    { label: 'Styles & Tarifs', icon: '✂️', section: 'catalogue', badge: () => services.length },
                    { label: 'Prendre RDV', icon: '📅', section: 'booking' }
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
            document.getElementById('sidebar').classList.add('open');
            document.getElementById('sidebar').setAttribute('aria-hidden', 'false');
            document.getElementById('sidebarOverlay').classList.add('open');
            document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'true');
        }

        function closeSidebar() {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebar').setAttribute('aria-hidden', 'true');
            document.getElementById('sidebarOverlay').classList.remove('open');
            document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
        }

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeSidebar();
                closePinModal();
            }
        });

        // Gestion de la navigation dynamique
        function switchSection(sectionId) {
            if (sectionId === 'admin' && !adminUnlocked) {
                openPinModal();
                return;
            }
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
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

        // Catalogue généré à partir de la liste des prestations
        function renderCatalogue() {
            const categories = ['Tout', ...new Set(services.map(s => s.category))];
            const filters = document.getElementById('catalogueFilters');
            filters.innerHTML = '';
            categories.forEach(cat => {
                const chip = document.createElement('button');
                chip.className = 'chip' + (cat === catalogueFilter ? ' active' : '');
                chip.textContent = cat;
                chip.onclick = () => { catalogueFilter = cat; renderCatalogue(); };
                filters.appendChild(chip);
            });

            const grid = document.getElementById('catalogueGrid');
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
                            <button class="card-book">Réserver cette prestation</button>
                        </div>`;
                    card.querySelector('.card-book').onclick = () => bookService(s.id);
                    grid.appendChild(card);
                });
        }

        function bookService(serviceId) {
            const input = document.querySelector(`input[name="service"][value="${serviceId}"]`);
            if (input) input.checked = true;
            switchSection('booking');
        }

        // Formulaire de réservation
        function renderBookingForm() {
            const picker = document.getElementById('servicePicker');
            picker.innerHTML = services.map(s => `
                <label class="service-option">
                    <input type="radio" name="service" value="${s.id}">
                    <span>${escapeHtml(s.name)}<small>${escapeHtml(s.price)}</small></span>
                </label>`).join('');

            const slots = document.getElementById('slotPicker');
            slots.innerHTML = '';
            timeSlots.forEach(t => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'chip';
                chip.textContent = t;
                chip.onclick = () => {
                    selectedSlot = t;
                    slots.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
                    document.getElementById('slotGroup').classList.remove('invalid');
                };
                slots.appendChild(chip);
            });

            const today = new Date();
            today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
            document.getElementById('clientDate').min = today.toISOString().split('T')[0];

            document.querySelectorAll('#bookingForm .form-control, #bookingForm input[type=radio]').forEach(el => {
                el.addEventListener('input', () => el.closest('.form-group')?.classList.remove('invalid'));
                el.addEventListener('change', () => el.closest('.form-group')?.classList.remove('invalid'));
            });
        }

        function setInvalid(el, invalid) {
            el.closest('.form-group').classList.toggle('invalid', invalid);
            return !invalid;
        }

        // Soumission d'une réservation par un client
        function handleBooking(event) {
            event.preventDefault();
            const nameEl = document.getElementById('clientName');
            const phoneEl = document.getElementById('clientPhone');
            const dateEl = document.getElementById('clientDate');
            const serviceEl = document.querySelector('input[name="service"]:checked');

            const name = nameEl.value.trim();
            const phone = phoneEl.value.trim();
            const date = dateEl.value;
            const isMonday = date && new Date(date + 'T00:00:00').getDay() === 1;

            let ok = true;
            ok = setInvalid(nameEl, name.length < 2) && ok;
            ok = setInvalid(phoneEl, phone.replace(/\D/g, '').length < 9) && ok;
            ok = setInvalid(document.getElementById('servicePicker'), !serviceEl) && ok;
            ok = setInvalid(dateEl, !date || date < dateEl.min || isMonday) && ok;
            ok = setInvalid(document.getElementById('slotPicker'), !selectedSlot) && ok;

            if (!ok) {
                showToast('Merci de compléter les champs indiqués.', 'error');
                return;
            }

            const service = services.find(s => s.id === serviceEl.value).name;
            const btn = document.getElementById('bookingSubmit');
            btn.disabled = true;
            btn.textContent = 'Envoi en cours…';

            setTimeout(() => {
                clientsData.push({ name, phone, service, date, time: selectedSlot, notes: document.getElementById('clientNotes').value.trim(), status: "Nouveau RDV" });
                showToast(`Merci ${name} ! Votre demande pour le ${formatDate(date)} à ${selectedSlot} est enregistrée. Le salon vous contactera rapidement.`, 'success');
                document.getElementById('bookingForm').reset();
                selectedSlot = null;
                document.querySelectorAll('#slotPicker .chip').forEach(c => c.classList.remove('active'));
                btn.disabled = false;
                btn.textContent = 'Confirmer la réservation';
                switchSection('home');
            }, 600);
        }

        // Gestion de la sécurité PIN pour l'espace interne
        function openPinModal() {
            document.getElementById('pinInput').value = '';
            document.getElementById('pinError').style.display = 'none';
            document.getElementById('pinModal').classList.add('open');
            setTimeout(() => document.getElementById('pinInput').focus(), 100);
        }

        function closePinModal() {
            document.getElementById('pinModal').classList.remove('open');
        }

        document.getElementById('pinInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') verifyPin();
        });

        function verifyPin() {
            const pin = document.getElementById('pinInput').value;
            // Code PIN fixé à "1234" pour l'exemple interne
            if (pin === "1234") {
                adminUnlocked = true;
                closePinModal();
                renderAdminTable();
                switchSection('admin');
                showToast('Bienvenue dans l’espace salon.', 'success');
            } else {
                document.getElementById('pinError').style.display = 'block';
                const content = document.querySelector('.modal-content');
                content.classList.remove('shake');
                void content.offsetWidth;
                content.classList.add('shake');
            }
        }

        // Affichage du tableau interne des clients
        function renderAdminStats() {
            const todayIso = document.getElementById('clientDate').min;
            const stats = [
                { label: 'Total fiches', value: clientsData.length },
                { label: 'Nouveaux RDV', value: clientsData.filter(c => c.status === 'Nouveau RDV').length, highlight: true },
                { label: 'Confirmés', value: clientsData.filter(c => c.status === 'Confirmé').length },
                { label: 'À venir', value: clientsData.filter(c => c.date >= todayIso).length }
            ];
            document.getElementById('adminStats').innerHTML = stats.map(s =>
                `<div class="stat${s.highlight ? ' highlight' : ''}"><span>${s.label}</span><strong>${s.value}</strong></div>`
            ).join('');

            const filters = document.getElementById('statusFilters');
            filters.innerHTML = '';
            ['Tous', ...statuses.map(s => s.label)].forEach(label => {
                const chip = document.createElement('button');
                chip.className = 'chip' + (label === adminStatusFilter ? ' active' : '');
                chip.textContent = label;
                chip.onclick = () => { adminStatusFilter = label; renderAdminTable(); };
                filters.appendChild(chip);
            });
        }

        function renderAdminTable() {
            renderAdminStats();
            const query = document.getElementById('adminSearch').value.trim().toLowerCase();
            const tbody = document.getElementById('clientsTableBody');
            const rows = clientsData
                .map((client, index) => ({ client, index }))
                .filter(({ client }) => adminStatusFilter === 'Tous' || client.status === adminStatusFilter)
                .filter(({ client }) => !query || `${client.name} ${client.phone} ${client.service}`.toLowerCase().includes(query))
                .sort((a, b) => (a.client.date + (a.client.time || '')).localeCompare(b.client.date + (b.client.time || '')));

            if (rows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><span class="big">🌿</span>Aucune fiche ne correspond.<br><small>Les nouvelles réservations apparaîtront ici.</small></td></tr>`;
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
                        <td>${escapeHtml(client.service)}${client.notes ? `<small style="display:block;color:var(--text-muted);max-width:240px;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(client.notes)}">📝 ${escapeHtml(client.notes)}</small>` : ''}</td>
                        <td>${escapeHtml(formatDate(client.date))}${client.time ? `<small style="display:block;color:var(--text-muted);">${escapeHtml(client.time)}</small>` : ''}</td>
                        <td><select class="status-select ${status.cls}" onchange="updateStatus(${index}, this.value)" aria-label="Statut">${options}</select></td>
                        <td><button class="icon-btn" onclick="deleteClient(${index})" title="Supprimer" aria-label="Supprimer">🗑</button></td>
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
                renderAdminTable();
                renderMenu();
                showToast('Fiche supprimée.');
            }
        }

        // Horaires : pied de page + statut ouvert / fermé
        function renderHours() {
            const now = new Date();
            const today = now.getDay();
            const order = [2, 3, 4, 5, 6, 0, 1];
            document.getElementById('footerHours').innerHTML = order.map(i => {
                const h = openingHours[i];
                const txt = h.open === null ? 'Fermé' : `${h.open}h – ${h.close}h`;
                return `<li class="${i === today ? 'today' : ''}"><span>${h.day}</span><span>${txt}</span></li>`;
            }).join('');

            const h = openingHours[today];
            const hour = now.getHours() + now.getMinutes() / 60;
            const isOpen = h.open !== null && hour >= h.open && hour < h.close;
            const el = document.getElementById('sidebarStatus');
            el.textContent = isOpen ? `Ouvert · ferme à ${h.close}h` : 'Fermé actuellement';
            el.classList.toggle('is-open', isOpen);
            document.getElementById('year').textContent = now.getFullYear();
        }

        // Apparition des blocs au défilement
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        renderCatalogue();
        renderBookingForm();
        renderHours();
        renderMenu();