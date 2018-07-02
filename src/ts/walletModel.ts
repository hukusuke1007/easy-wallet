import localForage from 'localforage'

export default class walletModel {
    balance: string = ''
    address: string = ''
    privateKey: string = ''
    publicKey: string = ''

    constructor() {
        this.load()
    }

    async save() {
        let key = 'wallet'
        let result:any = await localForage.setItem(key, this.toJSON())
        return result
    }

    async load() {
        let key = 'wallet'
        let result:any = await localForage.getItem(key)
        this.address = result.address
        this.privateKey = result.privateKey
        this.publicKey = result.publicKey
        return result
    }

    async remove() {
        let key = 'wallet'
        let result:any = await localForage.removeItem(key)
        return result
    }

    toJSON() {
        return {
            address: this.address,
            privateKey: this.privateKey,
            publicKey: this.publicKey
        }
    }
}