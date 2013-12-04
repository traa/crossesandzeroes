


var storage = {

	'games': [],
	'gameplayers':[],
	'turns': []

};


module.exports = {

	get: function(key, opts) {
		var result;

		if (opts && opts.id) {
			result = storage[key][opts.id];
		} else {
			result = storage[key];
		}

		return result;
	},

	count: function(key, opts) {
		var count = 0;
		if (storage[key]) {
			if (opts && opts.id) {

				if(storage[key][opts.id]) {
					count = storage[key][opts.id].length;
				}
				
			} else {
				count = storage[key].length;
			}
			
		}

		return count;

	},

	create: function(key, value, opts) {

		if (opts && opts.id) {
			storage[key][opts.id] = value;
		} else {
			//to avoid bad zero id 
			if (storage[key].length == 0) {
				storage[key][1] = value;
			} else {
				storage[key].push(value);
			}
		}

		
		return storage[key].length - 1;
	},


	update: function(key, value, opts) {

		if (storage[key]) {

			if (opts && opts.id) {
				storage[key][opts.id] = value;
			} else {
				storage[key] = value;
			}

		}
	}

};