const Database = require("../db/database")
const db = new Database(__dirname + "/../db/files/servers.json")

const logger = require("./console")
const log = logger.getInstance()

class CustomCommands {
    constructor() {
        if(!CustomCommands.instance) {
            this.commandData = {};
            this.Textcache = {};
            this.Slashcache = {};
            
            CustomCommands.instance = this
        }

        return CustomCommands.instance
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new CustomCommands();
        }
        return CustomCommands.instance
    }

    /**
     * 
     * @param {*} name 
     * @param {*} server_id 
     * @param {json} data => {} 
     * @param {*} slot za pomocą "_" oddzielamy dane z nazwy więc nie może być w name
     */
    addCommand(name, server_id, data, slot, type) {
        db.write(`${server_id}.custom_commands.${type}.${slot}`, data)
        this.addCacheCommandText(server_id, data.trigger, data.response)
        return true
    }

    addCacheCommandText(server_id, trigger, res) {
        const name = `${server_id}_${trigger}`
        this.Textcache[name] = res
    }

    removeCacheCommandText(server_id, trigger) {
        const name = `${server_id}_${trigger}`
        delete this.Textcache[name]
    }

    getCommandData(name, server_id) {
        if(this.commandData[`${server_id}_${name}`]) {
            return this.commandData[`${server_id}_${name}`]
        } else {
            return null
        }
    }

    deleteCommand(name, server_id) {
        delete this.commandData[`${server_id}_${name}`]
    }

    loadTextCommands() {
        //for each guild in db load all commands using

        const data = db.getAllKeys()
        if(!data) return;

        data.forEach(key => {
            const guildCustomCommands = db.read(`${key}.custom_commands.text`)
            if(!guildCustomCommands) return;
            //są jakieś komendy
            const dataArray = Object.values(guildCustomCommands);

            dataArray.forEach(command => {
                if(!command || !command.trigger || !command.response) return;
                if(!command.status || command.status != true) return
                this.addCacheCommandText(key, command?.trigger, command?.response)
            })
        })

        log.log("All Custom Text Commands Loaded.")
        return true
    }

    getTextCommand(server_id, trigger) {
        const _trigger = `${server_id}_${trigger}`
        if(this.Textcache[_trigger]) {
            return this.Textcache[_trigger]
        } else {
            return null
        }
    }
}

class CustomSlashCommands {
    constructor() {
        if(!CustomSlashCommands.instance) {
            this.commandData = {};
            
            CustomSlashCommands.instance = this
        }

        return CustomSlashCommands.instance
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new CustomSlashCommands();
        }
    }

    /**
     * 
     * @param {*} name 
     * @param {*} server_id 
     * @param {json} data
     * 
     * save command to db
     */
    addCommand(name, server_id, data) {
        
    }

    /**
     * load all custom commands from db
     */
    loadCommands() {

    }

    getAllCommands() {
        return
    }

    /**
     * delete commands from cache and db
     * @param {*} name 
     * @param {*} server_id 
     */
    deleteCommand(name, server_id) {
       
    }

    /**
     * execute command when passed interaction
     * @param {*} name 
     * @param {*} server_id 
     * @param {*} interaction 
     */
    executeCommand(name, server_id, interaction) {
        
    }

    registerCommands() {
        const all_commands = this.getAllCommands()
    }
}

const cc = CustomCommands.getInstance()
async function handleCustomTextCommands(message) {
    const content = message.content
    const server_id = message.guild.id
    if(!content) return;
    const getTextCommand = cc.getTextCommand(server_id, content)
    if(getTextCommand) {
        await message.reply(getTextCommand)
        return;
    }
}

module.exports = {CustomCommands, CustomSlashCommands, handleCustomTextCommands}