import Post from './dummy/models/Post';
import {
    Post as ApiPost,
    PostWithAllNesterRelations as ApiPostWithAllNesterRelations,
    PaginatedPostsList as ApiPaginatedPostsList,
} from './dummy/data/json-api-responce';
import User from './dummy/models/User';
import Tag from './dummy/models/Tag';
import Comment from './dummy/models/Comment';

describe('it hydrates', () => {
    test('single object', async () => {
        const post = new Post();
        post.testApiResponse = ApiPost;

        let result = await post.find(1);

        expect(result).toBeInstanceOf(Post);
        expect(result.id).toEqual(ApiPost.data.id);
        expect(result.type).toEqual(ApiPost.data.type);
        expect(result.title).toEqual(ApiPost.data.attributes.title);
        expect(result.subtitle).toEqual(ApiPost.data.attributes.subtitle);
        expect(result.body).toEqual(ApiPost.data.attributes.body);
        expect(result.published_at.format('YYYY-MM-DD')).toEqual(ApiPost.data.attributes.published_at);
    });

    test('single object collection with links and meta', async () => {
        const post = new Post();
        post.testApiResponse = ApiPaginatedPostsList;

        let result = await post.all();

        expect(result.data.length).toEqual(4);
        expect(result.data[0]).toBeInstanceOf(Post);
        expect(result.links).toEqual(ApiPaginatedPostsList.links);
        expect(result.meta).toEqual(ApiPaginatedPostsList.meta);
    });

    test('single object with relations', async () => {
        const post = new Post();
        post.testApiResponse = ApiPostWithAllNesterRelations;

        let result = await post.find(1);

        expect(result).toBeInstanceOf(Post);
        expect(result.id).toEqual(ApiPost.data.id);
        expect(result.type).toEqual(ApiPost.data.type);
        expect(result.title).toEqual(ApiPost.data.attributes.title);
        expect(result.subtitle).toEqual(ApiPost.data.attributes.subtitle);
        expect(result.body).toEqual(ApiPost.data.attributes.body);
        expect(result.published_at.format('YYYY-MM-DD')).toEqual(ApiPost.data.attributes.published_at);

        expect(result.author).toBeInstanceOf(User);
        expect(result.author.name).toEqual('Heidi Hintz Jr.');

        expect(result.tags.data.length).toEqual(2);
        expect(result.tags.data[0]).toBeInstanceOf(Tag);
        expect(result.tags.data[1]).toBeInstanceOf(Tag);
        expect(result.comments.data.length).toEqual(2);
        expect(result.comments.data[0]).toBeInstanceOf(Comment);
        expect(result.comments.data[1]).toBeInstanceOf(Comment);
        expect(result.comments.data[0].author).toBeInstanceOf(User);
        expect(result.comments.data[1].author).toBeInstanceOf(User);
    });
});