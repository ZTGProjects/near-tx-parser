const dotenv = require('dotenv');
dotenv.config();

/**
 * TXParser: a simple parser to return TX Actions in a more readeable form to be used for logging
 * Return object will be an array and can have multiple Actions in a readable form
 * 
 */
class TXParser {

	action_stack = new Array();
	error = false;
	msg = "";
	FACTOR = 1000000000000000000000000;

	/**
	 * 
	 * @param {*} res 
	 * @returns 
	 */
	async parse(res, type = "") {

		if (type != '') {
			if (type == 'create-account') {
				console.log('Account '+res.accountId+' for network "'+res.networkId+'" was created.');
				return;
			}
		}
		else {
			if (typeof res.data == 'undefined' && typeof res.transaction == 'undefined' && typeof res) {
				try {
					let str = JSON.stringify(res);
					let check_json = JSON.parse(str);
					console.log(res);
				}
				catch (e) {
					console.log("Unknown error thrown");
				}
			}
			if (process.env['NEAR_USE_TX_PARSER'] == 'NONE') {
				console.log("None");
				return;
			}
			if (process.env['NEAR_USE_TX_PARSER'] == 'RAW') {
				console.log("raw");
				return;
			}

			// below will work for both FRIEND and STRACK_TRACE
			// note that STACK_TRACE, if no error, will also come here
			if (typeof res.data != 'undefined') {
				this.action_stack.push({ 'readable': res.data });
			}
			if (typeof res.transaction != 'undefined') {
				this.parseAction(res);
				this.setActionType();
				this.prepareReadable();
			}
			this.action_stack.forEach(function (i, v) {
				console.log(i.readable);
			});
			return;
		}

	}



	/**
	 * 
	 * @param {*} tx 
	 */
	parseAction(tx) {
		const signer_id = tx.transaction.signer_id;
		const receiver_id = tx.transaction.receiver_id;
		let _this = this;
		tx.transaction.actions.forEach(element => {
			_this.action_stack.push({ "payload": element, "meta": { "signer_id": signer_id, "receiver_id": receiver_id } });
		});

	}

	/**
	 * 
	 */
	setActionType() {
		let _this = this;
		let keys;
		this.action_stack.forEach((element, i) => {
			if (typeof element.payload == 'object') {
				keys = Object.keys(element.payload)[0];
			}
			else {
				keys = element.payload;
			}
			_this.action_stack[i]['type'] = keys;
		});

	}

	/**
	 * 
	 */
	prepareReadable() {
		let _this = this;
		this.action_stack.forEach((element, i) => {
			switch (element.type) {
				case "CreateAccount":
					_this.action_stack[i]['readable'] = _this._parseCreateAccount(_this.action_stack[i]);
					break;
				case "Transfer":
					_this.action_stack[i]['readable'] = _this._parseTransfer(_this.action_stack[i]);
					break;
				case "AddKey":
					_this.action_stack[i]['readable'] = _this._parseAddKey(_this.action_stack[i]);
					break;
				case "FunctionCall":
					_this.action_stack[i]['readable'] = _this._parseFunctionCall(_this.action_stack[i]);
					break;
				case "DeployContract":
					_this.action_stack[i]['readable'] = _this._parseDeployContract(_this.action_stack[i]);
					break;
				case "DeleteAccount":
					_this.action_stack[i]['readable'] = _this._parseDeleteAccount(_this.action_stack[i]);
					break;
				default:
					_this.error = true;
					_this.msg = "Parser " + element.type + " not defined";
			}
		});

	}

	/**
	 * Create Account include 3 Actions
	 * - CreateAccount
	 * - Transfer
	 * - AddKey
	 * 
	 * @param {*} payload 
	 * @returns 
	 */
	_parseCreateAccount(payload) {
		return "New Account created: " + payload.meta.receiver_id;
	}

	/**
	 * 
	 * @param {*} payload 
	 * @returns 
	 */
	_parseTransfer(payload) {
		let amt = payload.payload.Transfer.deposit / this.FACTOR;
		return "Received " + amt.toFixed(5) + " NEAR from " + payload.meta.signer_id;
	}

	/**
	 * 
	 * @param {*} payload 
	 * @returns 
	 */
	_parseAddKey(payload) {
		return "Access Key added for " + payload.meta.receiver_id;
	}

	/**
	 * 
	 * @param {*} payload 
	 * @returns 
	 */
	_parseFunctionCall(payload) {
		return "Method Called " + payload.payload.FunctionCall.method_name + " in contract " + payload.meta.receiver_id;
	}

	/**
	 * 
	 * @param {*} payload 
	 * @returns 
	 */
	_parseDeployContract(payload) {
		return "Contact deployed " + payload.meta.signer_id;
	}

	/**
	 * 
	 * @param {*} $payload 
	 */
	_parseDeleteAccount(payload) {
		return "Account " + payload.meta.signer_id + " deleted and amount transferred to beneficiary " + payload.payload.DeleteAccount.beneficiary_id;
	}

}

module.exports = TXParser;
