import {/* UnconfirmedTransactionListener, ConfirmedTransactionListener, */
  Account, AccountHttp, MosaicHttp, NEMLibrary, NetworkTypes, Address, ServerConfig,
  SimpleWallet, Password, EncryptedPrivateKey, TimeWindow, Message, PlainMessage, XEM,
  TransactionHttp, TransferTransaction, AccountOwnedMosaicsService, MosaicId, Transaction,
  PublicAccount, MultisigAggregateModificationTransaction, CosignatoryModification, CosignatoryModificationAction,
  MultisigTransaction, TransactionTypes, MultisigSignatureTransaction, SignedTransaction} from 'nem-library'
import {Observable} from 'rxjs/Observable'
import nem from 'nem-sdk'
import encoding from 'encoding-japanese'
import { MULTISIG_ACCOUNT_ADDRESS, MULTISIG_ACCOUNT_PRIVATE_KEY, MULTISIG_ACCOUNT_PUBIC_KEY, CONSIG_1_ADDRESS,
        CONSIG_1_PRIVATE_KEY, CONSIG_1_PUBIC_KEY, CONSIG_2_ADDRESS, CONSIG_2_PRIVATE_KEY, CONSIG_2_PUBIC_KEY, SENDER_ADDRESS } from './define'

NEMLibrary.bootstrap(NetworkTypes.MAIN_NET)
const nodes: Array<ServerConfig> = [
  {protocol: 'https', domain: 'aqualife2.supernode.me', port: 7891},
  {protocol: 'https', domain: 'aqualife3.supernode.me', port: 7891},
  {protocol: 'https', domain: 'happy.supernode.me', port: 7891},
  {protocol: 'https', domain: 'mnbhsgwbeta.supernode.me', port: 7891},
  {protocol: 'https', domain: 'nsm.supernode.me', port: 7891},
  {protocol: 'https', domain: 'kohkei.supernode.me', port: 7891},
  {protocol: 'https', domain: 'mttsukuba.supernode.me', port: 7891},
  {protocol: 'https', domain: 'strategic-trader-1.supernode.me', port: 7891},
  {protocol: 'https', domain: 'strategic-trader-2.supernode.me', port: 7891},
  {protocol: 'https', domain: 'shibuya.supernode.me', port: 7891},
  {protocol: 'https', domain: 'qora01.supernode.me', port: 7891},
  {protocol: 'https', domain: 'pegatennnag.supernode.me', port: 7891}
]


export default class nemWrapper {
    endpoint: string = ''
    host: string = ''
    port: string = ''
    net: string = ''

    accountHttp: AccountHttp = new AccountHttp(nodes)
    transactionHttp: TransactionHttp = new TransactionHttp(nodes)

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

    /* マルチシグアカウントから出金時の手数料
      転送トランザクションの手数料: 送る XEM、モザイクなどに依存。
      マルチシグトランザクションの手数料: 0.15 XEM。
      マルチシグ署名トランザクション: 0.15 XEM

      全部マルチシグアカウントから手数料が引かれるみたいです。
      合計で、転送トランザクションなどの手数料 + 必要署名数 * 0.15 XEM の手数料
    */
    testMultisig() {
      let privateKey: string = MULTISIG_ACCOUNT_PRIVATE_KEY // マルチシグアカウント
      let publicKeys: Array<string> = [CONSIG_1_PUBIC_KEY]
      this.createMultisigAccount(privateKey, publicKeys).then(result => {
        console.log("testMultisig", result)
      })
    }

    testSendMultisig() {
      let consigPrivateKey = CONSIG_1_PRIVATE_KEY           // 署名者1
      let multisigPublicKey = MULTISIG_ACCOUNT_PUBIC_KEY    // マルチシグアカウント
      let toAddr: string = SENDER_ADDRESS                   // 送金先.
      let amount: number = 1 / Math.pow(10, 6)
      this.sendXemMultisig(consigPrivateKey, multisigPublicKey, toAddr, amount, "")
        .then(result => {
          console.log("testSendMultisig", result)
        }).catch(error => {
          console.error("testSendMultisig", error)
        })
    }

    testGetTransaction() {
      let addr: string = MULTISIG_ACCOUNT_ADDRESS // マルチシグアカウント
      this.getTransaction(addr).then(result => {
        console.log("testGetTransaction", result)
      })
    }

    testSignMultisig() {
      let addr: string = MULTISIG_ACCOUNT_ADDRESS // マルチシグアカウント
      this.signMultisigTransaction(addr)
    }

    testModifyMultisig() {
      let consigPrivateKey = CONSIG_1_PRIVATE_KEY                   // 署名者1
      let multisigPublicKey: string = MULTISIG_ACCOUNT_PUBIC_KEY    // マルチシグアカウント
      let signPublicKeys: Array<string> = [CONSIG_2_PUBIC_KEY]      // 署名者2
      this.modifyMultisigAccount(consigPrivateKey, multisigPublicKey, signPublicKeys).then(result => {
        console.log("testModifyMultisig", result)
      })
    }

    testGetUncofirmedTx() {
      let addr: string = MULTISIG_ACCOUNT_ADDRESS
      this.getUnconfirmedTransactions(addr)
    }

    // マルチシグ変更トランザクション取得
    getMultisigModifications(signPublicKeys: Array<string>) {
      let modifications: Array<CosignatoryModification> = []
      signPublicKeys.forEach((element: string) => {
        let consignatory = PublicAccount.createWithPublicKey(element)
        let modification: CosignatoryModification = new CosignatoryModification(consignatory, CosignatoryModificationAction.ADD)
        modifications.push(modification)
      })
      const convertIntoMultisigTransaction = MultisigAggregateModificationTransaction.create(
        TimeWindow.createWithDeadline(),
        modifications,
        1
      )
      return convertIntoMultisigTransaction
    }

    // マルチシグアカウント作成
    createMultisigAccount(targetPrivateKey: string, signPublicKeys: Array<string>) {
      return new Promise((resolve, reject) => {
        const account = Account.createWithPrivateKey(targetPrivateKey)
        const convertIntoMultisigTransaction = this.getMultisigModifications(signPublicKeys)
        const signedTransaction = account.signTransaction(convertIntoMultisigTransaction)
        this.transactionHttp.announceTransaction(signedTransaction).subscribe(
          result => {
            console.log(result)
            resolve(result)
          },
          error => {
            console.error(error)
            reject(error)
          }
        )
      })
    }

    // マルチシグ設定変更
    modifyMultisigAccount(consigPrivateKey: string, multisigPublicKey: string, signPublicKeys: Array<string>) {
      return new Promise((resolve, reject) => {
        const modifyMultisigTransaction = this.getMultisigModifications(signPublicKeys)
        const multisigTransaction: MultisigTransaction = MultisigTransaction.create(
          TimeWindow.createWithDeadline(),
          modifyMultisigTransaction,
          PublicAccount.createWithPublicKey(multisigPublicKey)
        )
        const account = Account.createWithPrivateKey(consigPrivateKey)
        const signedTransaction = account.signTransaction(multisigTransaction);
        this.transactionHttp.announceTransaction(signedTransaction).subscribe(
          result => {
            console.log(result)
            resolve(result)
          },
          error => {
            console.error(error)
            reject(error)
          }
        )
      })
    }

    // マルチシグトランザクション作成
    createMultisigTransaction(multisigPublicKey: string, addr: string, amount: number, message: string) {
      const transferTransaction: Transaction = TransferTransaction.create(
          TimeWindow.createWithDeadline(),
          new Address(addr),
          new XEM(amount),
          PlainMessage.create(message)
      )
      const multisigTransaction: MultisigTransaction = MultisigTransaction.create(
          TimeWindow.createWithDeadline(),
          transferTransaction,
          PublicAccount.createWithPublicKey(multisigPublicKey)
      )
      return multisigTransaction
    }

    // マルチシグアカウントからNEMを送金
    sendXemMultisig(consigPrivateKey: string, multisigPublicKey: string, addr: string, amount: number, message: string) {
      return new Promise((resolve, reject) => {
        let multisigTransaction = this.createMultisigTransaction(multisigPublicKey, addr, amount, message)
        let account = Account.createWithPrivateKey(consigPrivateKey)
        let signedTransaction = account.signTransaction(multisigTransaction)
        this.transactionHttp.announceTransaction(signedTransaction).subscribe(
          result => {
            console.log(result)
            return resolve(result)
          },
          error => {
            console.error(error)
            return reject(error)
          }
        )
      })
    }

    getUnconfirmedTransactions(addr: string) {

      this.accountHttp.unconfirmedTransactions(new Address(addr))
        .subscribe(result => {
            console.log("success")
            console.log(result)
        }, error => {
            console.log("error")
            console.error(error)
        })
    }

    // 署名者2名以降の人が未承認マルチシグトランザクション取得して署名して送金.
    signMultisigTransaction(multisigAddr: string) {
      // 署名者2
      const signerKey:string = CONSIG_2_PRIVATE_KEY
      const signer = Account.createWithPrivateKey(signerKey)
      // const signerPubKey:string = CONSIG_2_PUBIC_KEY

      this.accountHttp.unconfirmedTransactions(new Address(multisigAddr))
        .flatMap(x => x)
        .filter(transaction => transaction.type == TransactionTypes.MULTISIG)
        /*
        .filter((transaction: Transaction) =>
          ((transaction as MultisigTransaction).isPendingToSign()) &&
          ((transaction as MultisigTransaction).signatures) &&
          !((transaction as MultisigTransaction).signatures.map((s:MultisigSignatureTransaction) =>
            { return s.signer!.publicKey} ).some((s:string, index, array) =>
            { return s==signerPubKey}))
        )
        */
        .map((transaction: Transaction): MultisigSignatureTransaction => {
          let tx: MultisigTransaction = transaction as MultisigTransaction
          console.log("Transaction => MultisigTransaction", tx)
          return MultisigSignatureTransaction.create(
            TimeWindow.createWithDeadline(),
            tx.otherTransaction.signer!.address,
            tx.hashData!
          )
        })
        .map((transaction: MultisigSignatureTransaction) => signer.signTransaction(transaction))
        .flatMap((signedTransaction: SignedTransaction) =>
          this.transactionHttp.announceTransaction(signedTransaction)
        )
        .subscribe(result => {
            console.log("success")
            console.log(result)
        }, error => {
            console.log("error")
            console.error(error)
        })
    }

    // マルチシグのトランザクション履歴取得
    getTransaction(addr: string) {
      return new Promise((resolve, reject) => {
        this.accountHttp.allTransactions(new Address(addr))
        .map((transactions: Transaction[]): MultisigTransaction[] => {
            console.log(">>>>>>>>>>>>")
            console.log(addr, "All Transactions", transactions)
            return <MultisigTransaction[]>transactions.filter(x => x.type == TransactionTypes.MULTISIG)
        })
        .subscribe(
          (result: MultisigTransaction[]) => {
            console.log("\n\n>>>>>>>>>>>>")
            console.log(addr, "Just Multisig", result)
            resolve(result)
          },
          error => {
            console.error("getTransaction", error)
            reject(error)
          }
        )
      })
    }

    private getStr2Array(str:string) {
        let array = []
        for (let i = 0; i < str.length; i++) {
          array.push(str.charCodeAt(i))
        }
        return array
    }
}
