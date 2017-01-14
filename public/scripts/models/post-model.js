(function (root) {
    'use strict';

    let assert = root.blog.utils.assert;

    class PostModel {
        constructor(data) {
            assert(typeof data.title === 'string');
            assert(typeof data.body === 'string');

            this.id = data.id || root.uuid.v4();
            this.title = data.title;
            this.body = data.body;
        }

        toJSON() {
            return {
                id: this.id,
                title: this.title,
                body: this.body
            }
        }
    }

    root.blog.models.Post = PostModel;
}(window));
