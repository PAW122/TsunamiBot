declare var bootstrap: any;

interface ReactionRole {
    emoji: string;
    name: string;
    role_id: string;
    status: boolean;
}

interface ReactionRoleData {
    [channelId: string]: {
        [messageId: string]: ReactionRole[];
    };
}

class ReactionRoleSettings {
    private reactionRoles: ReactionRoleData = {};
    private channels: { id: string; name: string }[] = [];
    private roles: { id: string; name: string }[] = [];
    private editModal: any;
    private isLoggedIn: boolean = false;
    private loginButton: HTMLButtonElement | null;
    private logoutButton: HTMLButtonElement | null;
    private emojiPicker: HTMLDivElement | null = null;
    private isAddingWithMessage: boolean = false;
    private serverId: string;

    constructor() {
        this.loginButton = document.getElementById('loginButton') as HTMLButtonElement | null;
        this.logoutButton = document.getElementById('logoutButton') as HTMLButtonElement | null;
        this.serverId = this.getServerIdFromUrl();
        this.initializeEventListeners();
        this.checkLoginStatus();
        this.editModal = new bootstrap.Modal(document.getElementById('reactionRoleModal'));
    }

    private getServerIdFromUrl(): string {
        const pathSegments = window.location.pathname.split('/');
        return pathSegments[pathSegments.length - 1];
    }

    private checkLoginStatus() {
        const token = localStorage.getItem('token');
        const tokenType = localStorage.getItem('token_type');
        if (token && tokenType) {
            this.isLoggedIn = true;
            this.loadReactionRoles();
        } else {
            this.isLoggedIn = false;
        }
        this.updateLoginState();
    }

    private initializeEventListeners() {
        const addButton = document.getElementById('addReactionRole');
        const addWithMessageButton = document.getElementById('addReactionRoleAndMessage');
        const saveButton = document.getElementById('saveReactionRole');
        const emojiPicker = document.getElementById('emojiPicker');
        const deleteButton = document.getElementById('deleteReactionRole');

        if (addButton) addButton.addEventListener('click', () => this.openEditModal());
        if (addWithMessageButton) addWithMessageButton.addEventListener('click', () => this.openEditModal(undefined, undefined, undefined, true));
        if (saveButton) saveButton.addEventListener('click', () => this.saveReactionRole());
        if (emojiPicker) emojiPicker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleEmojiPicker();
        });
        if (this.loginButton) this.loginButton.addEventListener('click', () => this.login());
        if (this.logoutButton) this.logoutButton.addEventListener('click', () => this.logout());
        if (deleteButton) deleteButton.addEventListener('click', () => this.deleteReactionRole());

        document.addEventListener('click', (e) => {
            if (this.emojiPicker && !this.emojiPicker.contains(e.target as Node)) {
                this.closeEmojiPicker();
            }
        });
    }

    private async loadReactionRoles() {
        if (this.isLoggedIn) {
            try {
                console.log('Attempting to load reaction roles...');
                const token = localStorage.getItem('token');
                const tokenType = localStorage.getItem('token_type');
                const response = await fetch('/api_reactionrole/load_all', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tokenType,
                        token,
                        server_id: this.serverId
                    })
                });
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);

                if (response.ok) {
                    this.reactionRoles = data.reaction_role_data;
                    this.channels = data.channels;
                    this.roles = data.roles;
                    this.renderReactionRoleList();
                    this.populateDropdowns();
                } else {
                    console.error('Error:', data.error);
                }
            } catch (error) {
                console.error('Error loading reaction roles:', error);
            }
        }
    }

    private renderReactionRoleList() {
        const container = document.getElementById('reactionRoleList')!;
        container.innerHTML = '';
        if (!this.isLoggedIn) {
            container.innerHTML = '<p class="text-center">Please log in to view reaction roles.</p>';
            return;
        }

        for (const channelId in this.reactionRoles) {
            for (const messageId in this.reactionRoles[channelId]) {
                this.reactionRoles[channelId][messageId].forEach((rr, index) => {
                    const element = document.createElement('div');
                    element.className = 'col-md-4 mb-3';
                    element.innerHTML = `
                        <div class="card reaction-role-item" 
                             data-channel-id="${channelId}" 
                             data-message-id="${messageId}" 
                             data-index="${index}"
                             data-name="${rr.name}"
                             data-role-id="${rr.role_id}"
                             data-emoji="${rr.emoji}"
                             data-status="${rr.status}">
                            <div class="card-body">
                                <h5 class="card-title">${rr.name}</h5>
                                <p class="card-text">Role: ${this.getRoleName(rr.role_id)}</p>
                                <p class="card-text">Emoji: ${rr.emoji}</p>
                                <p class="card-text">Message ID: ${messageId}</p>
                                <p class="card-text">Status: ${rr.status ? 'Active' : 'Inactive'}</p>
                            </div>
                        </div>
                    `;
                    element.addEventListener('click', (e) => this.openEditModal(channelId, messageId, index, false, e.currentTarget as HTMLElement));
                    container.appendChild(element);
                });
            }
        }
    }

    private getRoleName(roleId: string): string {
        return this.roles.find(r => r.id === roleId)?.name || 'Unknown';
    }

    private populateDropdowns() {
        const channelSelect = document.getElementById('channel') as HTMLSelectElement;
        const roleSelect = document.getElementById('role') as HTMLSelectElement;

        channelSelect.innerHTML = '';
        roleSelect.innerHTML = '';

        this.channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = channel.name;
            channelSelect.appendChild(option);
        });

        this.roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name;
            roleSelect.appendChild(option);
        });
    }

    private openEditModal(channelId?: string, messageId?: string, index?: number, addWithMessage: boolean = false, clickedElement?: HTMLElement) {
        const form = document.getElementById('reactionRoleForm') as HTMLFormElement;
        const messageIdInput = document.getElementById('messageId') as HTMLInputElement;
        const messageContentInput = document.getElementById('messageContent') as HTMLTextAreaElement;
        const deleteButton = document.getElementById('deleteReactionRole') as HTMLButtonElement;

        form.reset();
        this.populateDropdowns();

        if (clickedElement) {
            const name = clickedElement.getAttribute('data-name') || '';
            const roleId = clickedElement.getAttribute('data-role-id') || '';
            const emoji = clickedElement.getAttribute('data-emoji') || '';
            messageId = clickedElement.getAttribute('data-message-id') || '';
            channelId = clickedElement.getAttribute('data-channel-id') || '';
            index = parseInt(clickedElement.getAttribute('data-index') || '0');

            (document.getElementById('name') as HTMLInputElement).value = name;
            (document.getElementById('role') as HTMLSelectElement).value = roleId;
            (document.getElementById('emojiName') as HTMLInputElement).value = emoji;
            messageIdInput.value = messageId;
            deleteButton.style.display = 'inline-block';
            deleteButton.setAttribute('data-channel-id', channelId);
            deleteButton.setAttribute('data-message-id', messageId);
            deleteButton.setAttribute('data-index', index.toString());
            deleteButton.setAttribute('data-emoji', emoji); // Added line from update
            messageIdInput.parentElement!.style.display = 'block';
            messageContentInput.parentElement!.style.display = 'none';
        } else {
            deleteButton.style.display = 'none';
            deleteButton.removeAttribute('data-channel-id');
            deleteButton.removeAttribute('data-message-id');
            deleteButton.removeAttribute('data-index');
            messageIdInput.parentElement!.style.display = 'block';
            messageContentInput.parentElement!.style.display = 'none';
        }

        this.editModal.show();
    }

    private async saveReactionRole() {
        const form = document.getElementById('reactionRoleForm') as HTMLFormElement;
        if (form.checkValidity()) {
            const name = (document.getElementById('name') as HTMLInputElement).value;
            const channelId = (document.getElementById('channel') as HTMLSelectElement).value;
            const roleId = (document.getElementById('role') as HTMLSelectElement).value;
            const emoji = (document.getElementById('emojiName') as HTMLInputElement).value;
            const messageId = (document.getElementById('messageId') as HTMLInputElement).value;

            const tokenType = localStorage.getItem('token_type');
            const token = localStorage.getItem('token');

            if (!tokenType || !token) {
                console.error('Authentication tokens not found');
                return;
            }

            try {
                const response = await fetch(`/api_reactionrole/save_reaction_by_id/${this.serverId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tokenType,
                        token,
                        server_id: this.serverId,
                        channel_id: channelId,
                        message_id: messageId,
                        role_id: roleId,
                        emoji,
                        status: true,
                        name
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'ok') {
                        console.log('Reaction role saved successfully');
                        if (!this.reactionRoles[this.serverId]) {
                            this.reactionRoles[this.serverId] = {};
                        }
                        if (!this.reactionRoles[this.serverId][messageId]) {
                            this.reactionRoles[this.serverId][messageId] = [];
                        }
                        this.reactionRoles[this.serverId][messageId].push({
                            name,
                            role_id: roleId,
                            emoji,
                            status: true
                        });
                        this.renderReactionRoleList();
                        this.editModal.hide();
                    } else {
                        console.error('Failed to save reaction role');
                    }
                } else {
                    console.error('Server returned an error', response.status);
                }
            } catch (error) {
                console.error('Error saving reaction role:', error);
            }
        } else {
            form.reportValidity();
        }
    }

    private toggleEmojiPicker() {
        if (this.emojiPicker) {
            this.closeEmojiPicker();
        } else {
            this.openEmojiPicker();
        }
    }

    private openEmojiPicker() {
        if (this.emojiPicker) return;

        const emojis = ['😀', '😂', '🎉', '❤️', '🎮', '🎨', '🎵', '📚'];
        this.emojiPicker = document.createElement('div');
        this.emojiPicker.className = 'emoji-picker';
        emojis.forEach(emoji => {
            const button = document.createElement('button');
            button.textContent = emoji;
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                (document.getElementById('emojiName') as HTMLInputElement).value = emoji;
                this.closeEmojiPicker();
            });
            this.emojiPicker!.appendChild(button);
        });
        document.body.appendChild(this.emojiPicker);
    }

    private closeEmojiPicker() {
        if (this.emojiPicker) {
            this.emojiPicker.remove();
            this.emojiPicker = null;
        }
    }

    private updateLoginState() {
        if (this.isLoggedIn) {
            this.loginButton!.classList.add('d-none');
            this.logoutButton!.classList.remove('d-none');
            document.getElementById('addReactionRole')!.classList.remove('d-none');
            document.getElementById('addReactionRoleAndMessage')!.classList.remove('d-none');
        } else {
            this.loginButton!.classList.remove('d-none');
            this.logoutButton!.classList.add('d-none');
            document.getElementById('addReactionRole')!.classList.add('d-none');
            document.getElementById('addReactionRoleAndMessage')!.classList.add('d-none');
        }
    }

    private login() {
        localStorage.setItem('token', 'fake_token');
        localStorage.setItem('token_type', 'Bearer');
        this.isLoggedIn = true;
        this.updateLoginState();
        this.loadReactionRoles();
    }

    private logout() { // TODO
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        this.isLoggedIn = false;
        this.updateLoginState();
        this.reactionRoles = {};
        this.renderReactionRoleList();
    }

    private async deleteReactionRole() {
        // const deleteButton = document.getElementById('deleteReactionRole') as HTMLButtonElement;
        // Pobieranie elementów
        const messageIdElement = document.getElementById("messageId") as HTMLInputElement;
        const emojiElement = document.getElementById("emojiName") as HTMLInputElement;

        const messageId = messageIdElement.value; // Odczytujemy wartość z elementu
        const emoji = emojiElement.value; 


        if (messageId && emoji) {
            const tokenType = localStorage.getItem('token_type');
            const token = localStorage.getItem('token');

            if (!tokenType || !token) {
                console.error('Authentication tokens not found');
                return;
            }

            try {
                const response = await fetch(`/api_reactionrole/remove_reaction_by_id/${this.serverId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tokenType,
                        token,
                        message_id: messageId,
                        emoji
                    })
                });

                if (response.ok) {
                    console.log('Reaction role deleted successfully');
                    // Remove the reaction role from the local data structure
                    for (const channelId in this.reactionRoles) {
                        if (this.reactionRoles[channelId][messageId]) {
                            this.reactionRoles[channelId][messageId] = this.reactionRoles[channelId][messageId].filter(rr => rr.emoji !== emoji);
                            if (this.reactionRoles[channelId][messageId].length === 0) {
                                delete this.reactionRoles[channelId][messageId];
                            }
                            if (Object.keys(this.reactionRoles[channelId]).length === 0) {
                                delete this.reactionRoles[channelId];
                            }
                            break;
                        }
                    }
                    this.renderReactionRoleList();
                    this.editModal.hide();
                } else {
                    console.error('Server returned an error', response.status);
                }
            } catch (error) {
                console.error('Error deleting reaction role:', error);
            }
        } else {
            console.error('Missing message ID or emoji for deletion');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ReactionRoleSettings();
});

