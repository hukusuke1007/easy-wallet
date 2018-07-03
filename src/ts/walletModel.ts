import localForage from 'localforage'
import nemWrapper from './nemWrapper'

export default class walletModel {
    balance: number = 0
    address: string = ''
    publicKey: string = ''
    privateKey: string = ''

    nem = new nemWrapper()
    constructor() {
        this.load()
        .then((result) => {
            console.log(result)
            if (result === null) {
                this.nem.createAccount()
                .then((wallet) => {
                    this.address = wallet.address
                    this.privateKey = wallet.privateKey
                    this.save()
                }).catch((error) => {
                    console.error(error)
                })
            }
        }).catch((error) => {
            console.error(error)
        })
    }

    async save() {
        let key = 'wallet'
        let result:any = await localForage.setItem(key, this.toJSON())
        return result
    }

    async load() {
        let key = 'wallet'
        let result:any = await localForage.getItem(key)
        if (result !== null) {
            this.address = result.address
            this.privateKey = result.privateKey
            this.publicKey = result.publicKey
        }
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