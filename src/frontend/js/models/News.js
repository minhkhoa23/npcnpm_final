class News {
    constructor({
        _id,
        tournamentId = null,
        title = '',
        content = '',
        images = [],
        authorId = null,
        status = 'public',
        publishedAt = null
    } = {}) {
        this._id = _id;
        this.tournamentId = tournamentId;
        this.title = title;
        this.content = content;
        this.images = images;
        this.authorId = authorId;
        this.status = status;
        this.publishedAt = publishedAt;
    }
}

export default News;
