class Cooldowns {
    constructor() {
        this.cooldowns = {};
    }

    add(name, time, unit) {
        const timestamp = this.getCurrentTimestamp();
        const expirationTime = this.calculateExpirationTime(time, unit);

        this.cooldowns[name] = {
            timestamp,
            expirationTime,
        };
    }

    read(name) {
        if (this.cooldowns[name]) {
            return this.cooldowns[name];
        } else {
            return null;
        }
    }

    isEnd(name) {
        const cooldown = this.cooldowns[name];

        if (!cooldown) {
            // Cooldown nie istnieje
            return 'Cooldown not found';
        }

        const currentTime = this.getCurrentTimestamp();
        const isEnd = currentTime >= cooldown.expirationTime;

        if (isEnd) {
            // Usunięcie informacji o cooldownie, jeżeli się skończył
            this.del(name);
        }

        return isEnd;
    }

    del(name) {
        delete this.cooldowns[name];
    }

    getCurrentTimestamp() {
        return Math.floor(new Date().getTime() / 1000);
    }

    calculateExpirationTime(time, unit) {
        const unitsInSeconds = {
            's': 1,
            'm': 60,
            'h': 3600,
            'd': 86400,
            'y': 31536000,
        };

        return this.getCurrentTimestamp() + time * unitsInSeconds[unit];
    }
}

module.exports = Cooldowns;