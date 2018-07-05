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
            this.getAccount()
        }).catch((error) => {
            console.error(error)
        })
    }

    // ローカルストレージへ保存.
    async save() {
        let key = 'wallet'
        let result:any = await localForage.setItem(key, this.toJSON())
        return result
    }

    // ローカルストレージから取得.
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

    // ローカルストレージから削除.
    async remove() {
        let key = 'wallet'
        let result:any = await localForage.removeItem(key)
        return result
    }

    // アカウント情報を取得.
    async getAccount() {
        let result = await this.nem.getAccount(this.address)
        this.balance = result.account.balance / this.nem.getNemDivisibility()
        if ( result.account.publicKey !== null ) { this.publicKey = result.account.publicKey }
    }

    // 送金(NEM)
    async sendNem(address:string, amount:number, message:string)  {
        let result = await this.nem.sendNem(address, this.privateKey, amount, message)
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