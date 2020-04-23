function Feeds(win, doc, container, url) {
	this.doc = doc;
	this.win = win;
	this.url = url;
	this.pageCount = 0;
	this.container = container;

	this.moreItemsBtn = this.doc.querySelector('.next-page');
	this.onNextPageClickFn = this.onNextPageClick.bind(this);
	this.onTableClickFn = this.onTableClick.bind(this);
	this.container.addEventListener('click', this.onTableClickFn, false);
}

function getDomainName(url) {
	let urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
	
	return urlParts[0];
}

Feeds.prototype.onTableClick = function onTableClickFn(e) {
	let targetRow = e.target.closest('tr');
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

		let listTemplate = `<tr class="list-item">
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