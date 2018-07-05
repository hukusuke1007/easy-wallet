import nem from 'nem-sdk'
import encoding from 'encoding-japanese'

export default class nemWrapper {
    endpoint: string = ''
    host: string = ''
    port: string = ''
    net: string = ''

    constructor () {
        // NIS設定.
        this.host = 'https://aqualife2.supernode.me'
        this.port = '7891'
        this.net = nem.model.network.data.mainnet.id
        this.endpoint = nem.model.objects.create("endpoint")(this.host, this.port)    
    }

    // NISの状態確認.
    async isNIS() {
        let result = await nem.com.requests.endpoint.heartbeat(this.endpoint)
        if (result.message === 'ok') {
            return true
        } else {
            return false
        }
    }

    // アカウント作成.
    async createAccount() {
        let walletName = "wallet"
        let password = "wallet"
        let wallet = nem.model.wallet.createPRNG(walletName, password, this.net)
        let common = nem.model.objects.create("common")(password, "")
        let account = wallet.accounts[0]
        nem.crypto.helpers.passwordToPrivatekey(common, account, account.algo)
        let result = {
            address: account.address,
            privateKey: common.privateKey
        }
        return result
    }

    // アカウント情報取得.
    async getAccount(address: string) {
        let result = await nem.com.requests.account.data(this.endpoint, address)
        return result
    }

    // 送金（NEM）
    async sendNem(address:string, privateKey:string, amount:number, message:string) {
        let common = nem.model.objects.create('common')('', privateKey)
        let transferTransaction = nem.model.objects.create('transferTransaction')(address, amount, message)
        let transactionEntity = nem.model.transactions.prepare('transferTransaction')(common, transferTransaction, this.net)
        let result = await nem.model.transactions.send(common, transactionEntity, this.endpoint)
        return result
    }

    // 送金（Mosaic）
    async sendMosaics(address:string, privateKey:string, mosaics:Array<any>, message:string) {
        let common = nem.model.objects.create('common')('', privateKey)
        let transferTransaction = nem.model.objects.create('transferTransaction')(address, 1, message)
        let mosaicDefinitionMetaDataPair:any = await this.getMosaicDefinitionMetaDataPair(this.endpoint, mosaics)
        mosaics.forEach((mosaic) => {
            let fullMosaicName = mosaic.namespace + ':' + mosaic.name
            if ((mosaicDefinitionMetaDataPair[fullMosaicName].mosaicDefinition.id.namespaceId === mosaic.namespace) &&
                (mosaicDefinitionMetaDataPair[fullMosaicName].mosaicDefinition.id.name === mosaic.name)) {
                let divisibility = 0
                mosaicDefinitionMetaDataPair[fullMosaicName].mosaicDefinition.properties.forEach((prop:any) => {
                    if (prop.name === 'divisibility') { divisibility = prop.value }
                })
                let quantity = mosaic.amount * Math.pow(10, divisibility)
                let mosaicAttachment = nem.model.objects.create('mosaicAttachment')(mosaic.namespace, mosaic.name, quantity)
                transferTransaction.mosaics.push(mosaicAttachment)
            }
        })
        let transactionEntity = nem.model.transactions.prepare('mosaicTransferTransaction')(common, transferTransaction, mosaicDefinitionMetaDataPair, this.net)
        let result = await nem.model.transactions.send(common, transactionEntity, this.endpoint)
        return result
    }

    // モザイク取得
    async getMosaics(address: string) {
        // 工事中
    }

    // モザイク定義取得.
    async getMosaicDefinitionMetaDataPair(endpoint:string, mosaics:Array<any>)
    {
        return new Promise(function(resolve, reject) {
            let mosaicDefinitionMetaDataPair = nem.model.objects.get('mosaicDefinitionMetaDataPair')
            let mosaicCount = 0
            mosaics.forEach((mosaic) => {
                let mosaicAttachment = nem.model.objects.create('mosaicAttachment')(mosaic.namespace, mosaic.name, mosaic.amount)
                let result = nem.com.requests.namespace.mosaicDefinitions(endpoint, mosaicAttachment.mosaicId.namespaceId)
                .then((result: any) => {
                    mosaicCount = mosaicCount + 1
                    let neededDefinition = nem.utils.helpers.searchMosaicDefinitionArray(result.data, [mosaic.name])
                    let fullMosaicName = nem.utils.format.mosaicIdToName(mosaicAttachment.mosaicId)
                    if (undefined === neededDefinition[fullMosaicName]) {
                        console.error('Mosaic not found !')
                        return
                    }
                    mosaicDefinitionMetaDataPair[fullMosaicName] = {}
                    mosaicDefinitionMetaDataPair[fullMosaicName].mosaicDefinition = neededDefinition[fullMosaicName]
                    let supply = 0
                    result.data.some((obj: any) => {
                    if ((obj.mosaic.id.namespaceId === mosaic.namespace) &&
                        (obj.mosaic.id.name === mosaic.name)) {
                            obj.mosaic.properties.some((prop: any) => {
                            if (prop.name === 'initialSupply') {
                                supply = prop.value
                                return true
                            }
                        })
                    }
                    })
                    mosaicDefinitionMetaDataPair[fullMosaicName].supply = supply
                    if (mosaicCount >= mosaics.length) { resolve(mosaicDefinitionMetaDataPair) }
                }).catch((e: any) => {
                    console.error(e)
                    reject(e)
                })
            })
        })
    }

    // QRコードjson取得.
    getQRcodeJson(v:string, type:number, name:string, addr:string, amount:number, msg:string) {
        // v:2, type:1 アカウント, type:2 請求書
        let amountVal = amount * Math.pow(10, 6)
        let json = {
          type: type,
          data: {
            name: name,
            addr: addr,
            amount: amountVal,
            msg: msg
          },
          v: v
        }
        let jsonString = JSON.stringify(json)
        let result = encoding.codeToString(encoding.convert(this.getStr2Array(jsonString), 'UTF8'))
        return result
    }

    // NEMの可分性取得
    getNemDivisibility(): number {
        return Math.pow(10, 6)
    }

    private getStr2Array(str:string) {
        let array = []
        for (let i = 0; i < str.length; i++) {
          array.push(str.charCodeAt(i))
        }
        return array
    }
}