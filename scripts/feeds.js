function Feeds(win, doc, container, url) {
	this.doc = doc;
	this.win = win;
	this.url = url;
	this.pageCount = 0;
	this.container = container;
	this.userId = 1; // Assuming user id is 1.

	this.moreItemsBtn = this.doc.querySelector('.next-page');
	this.onNextPageClickFn = this.onNextPageClick.bind(this);
	this.onTableClickFn = this.onTableClick.bind(this);
	this.container.addEventListener('click', this.onTableClickFn, false);
}

// To get the domain name from url 
function getDomainName(url) {
	let urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
	
	return urlParts[0];
}


// check whether the local storage data having the same record
function isDataExists(array, id) {
	let len = array.length;

	for (let i = 0; i < len; i++) {
		let data = array[i];

		if (data.feedId === id) {
			return true;
		}
	}

	return false;
}

Feeds.prototype.saveHideData = function hideFn(id) {
	// Check browser support
	if (typeof(Storage) !== "undefined") {
  		// Store

  		if (localStorage.getItem("hidefeed") === null) {
	  		localStorage.setItem("hidefeed", '[]');
  		}

  		let feedData = JSON.parse(localStorage.getItem("hidefeed"));
  		if (isDataExists(feedData, id) === false) {
	  		feedData.push({
	  			user : this.userId,			// Assuming the user id is 1
	  			feedId : id,
	  			isHidden: true
	  		});
  		}
		localStorage.setItem('hidefeed', JSON.stringify(feedData))
	}
}

// saving upvote data to local storage
Feeds.prototype.saveUpvote = function saveFn(id, targetRow) {
	// Check browser support
	if (typeof(Storage) !== "undefined") {
  		// Store

  		if (localStorage.getItem("upvotefeed") === null) {
	  		localStorage.setItem("upvotefeed", '[]');
  		}

  		let feedData = JSON.parse(localStorage.getItem("upvotefeed"));
  		if (isDataExists(feedData, id) === false) {
	  		feedData.push({
	  			user : this.userId,			// Assuming the user id is 1
	  			feedId : id,
	  			upvote: true
	  		});
	  		this.updateRow(targetRow);
  		}
		localStorage.setItem('upvotefeed', JSON.stringify(feedData))
	}
}

// updating UI of row after upvote
Feeds.prototype.updateRow = function updateFn(row) {
	let upvote = row.querySelector('.points'),
		upvoteCount = parseInt(upvote.textContent);

	upvote.classList.add('upvoted');
	upvote.innerHTML = '';
	upvote.appendChild(this.doc.createTextNode((upvoteCount+1)))
}

Feeds.prototype.onTableClick = function onTableClickFn(e) {
	let targetRow = e.target.closest('tr');

	if(e.target.classList.contains('upvote-button') === true) {
		this.saveUpvote(targetRow.dataset.id, targetRow);
	}

	if (e.target.classList.contains('hide-button') === true) {
		this.saveHideData(targetRow.dataset.id);
		targetRow.style.display = 'none';
	}
}

Feeds.prototype.onNextPageClick = function clickFn(e) {
	this.pageCount += 1;
	this.load(); 
}

Feeds.prototype.render = function renderFn(data) {
	let tbody = this.doc.createElement('tbody'),
		hits = data.hits,
		len = hits.length;

	tbody.classList.add('feeds-list');
	for(let i = 0; i < len; i++) {
		let feed = hits[i];
		let domainName = getDomainName(feed.url);

		let listTemplate = `<tr data-id="${feed.objectID}" class="list-item">
			<td><span class="comments">${feed.num_comments}</span><td>
			<td><span class="points">${feed.points}</span></td>
			<td><button aria-label="Upvote button" class="upvote-button"></button></td>
			<td>
				<span class="title">${feed.title}</span>
				<span class="domain">(${domainName})</span> by
				<span class="author">${feed.author}</span>
				<span>[<button aria-label="Hide button" class="hide-button">hide</button>]</span>
			</td>
		</tr>`

		let list = this.doc.createElement('tbody');

		list.innerHTML = listTemplate;

		// checks if user already upvoted feed
		let feedData = JSON.parse(localStorage.getItem("upvotefeed"));
		if (feedData !==null && isDataExists(feedData, feed.objectID) === true) {
			this.updateRow(list.firstChild);
		}

		tbody.appendChild(list.firstChild);
	}
	this.container.innerHTML = '';
	this.container.appendChild(tbody);
	this.moreItemsBtn.addEventListener('click', this.onNextPageClickFn, false)
}

Feeds.prototype.load = function loadFn() {
	let url = this.url + this.pageCount;

	fetch(url).then(res=>res.json())
		.then(data=>this.render(data))
}