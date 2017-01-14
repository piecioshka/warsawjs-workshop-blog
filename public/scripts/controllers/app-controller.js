(function (root) {
    'use strict';

    let runtime = root.blog.runtime;
    let constants = root.blog.constants;

    let StorageService = root.blog.services.StorageService;
    let LocalStorageAdapter = root.blog.adapters.LocalStorageAdapter;
    let RestAdapter = root.blog.adapters.RestAdapter;

    let AddPostFormComponent = root.blog.views.AddPostFormComponent;
    let PostComponent = root.blog.views.PostComponent;
    let PostNotFoundComponent = root.blog.views.PostNotFoundComponent;

    let PostModel = root.blog.models.Post;
    let PostListModel = root.blog.models.PostList;

    const STORAGE_KEY = 'posts';

    class AppController {
        constructor() {
            runtime.PostsService = new StorageService(STORAGE_KEY);
            runtime.PostsService.setAdapter(LocalStorageAdapter);

            this.postListModel = new PostListModel();

            runtime.on(constants.post.NEW_POST, (formData) => {
                let post = {
                    title: formData['post-title'],
                    body: formData['post-body'],
                };
                this._appendPostModel(post);
                this._renderPostList();
                this._savePosts();
            });

            new AddPostFormComponent();
        }

        _savePosts() {
            runtime.PostsService.save(this.postListModel.toJSON());
        }

        _loadPosts(callback = Function) {
            this.postListModel.clear();
            runtime.PostsService.fetch((error, postList) => {
                postList.forEach(this._appendPostModel, this);
                callback();
            });
        }

        onPostListHandler() {
            console.log('[+] Display list of posts');

            this._loadPosts(() => {
                this._renderPostList();
            });
        }

        onPostHandler(context) {
            let postId = Number(context.params.id);
            console.log('[+] Display post: %s', postId);

            this._loadPosts(() => {
                this._renderPostList(postId);
            });
        }

        onPostRemoveHandler(context) {
            let postId = Number(context.params.id);
            console.log('%c[+] Remove post: %s', 'color: red', postId);

            this.postListModel.removePostModel(postId);
            this._savePosts();

            runtime.router.navigate('/');
        }

        _renderPostList(postId) {
            function clearPostContainer() {
                document.querySelector('#js-list-of-posts').innerText = '';
            }

            function renderSinglePost(postModel) {
                new PostComponent(postModel.toJSON());
            }

            clearPostContainer();

            if (typeof postId === 'number') {
                let postModel = this.postListModel.getPost(postId);

                if (postModel) {
                    renderSinglePost(postModel);
                } else {
                    new PostNotFoundComponent(postId);
                }
            } else {
                console.group('Render list of posts');
                this.postListModel.each(renderSinglePost);
                console.groupEnd('Render posts');
            }
        }

        _appendPostModel(post) {
            this.postListModel.addPostModel(new PostModel(post));
        }
    }

    root.blog.controllers.AppController = AppController;
}(window));
