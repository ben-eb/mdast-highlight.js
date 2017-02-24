import {readFileSync as read} from 'fs';
import {join} from 'path';
import test from 'ava';
import remark from 'remark';
import html from 'remark-html';
import hljs from '../';

const base = file => read(join(__dirname, 'fixtures', file), 'utf-8');

test('should highlight css & js', t => {
    const {contents} = remark().use([ html, hljs ]).processSync(base('input.md'));
    t.deepEqual(contents, base('output.html'));
});

test('should not highlight when the language is not specified (include)', t => {
    const input = '# Hello!\n\n```css\nh1{}\n```';
    const {contents} = remark().use(html).use(hljs, {include: ['html']}).processSync(input);
    t.deepEqual(contents, '<h1>Hello!</h1>\n<pre><code class=\"language-css\">h1{}\n</code></pre>\n');
});

test('should not highlight when the language is not specified (exclude)', t => {
    const input = '# Hello!\n\n```css\nh1{}\n```';
    const {contents} = remark().use(html).use(hljs, {exclude: ['css']}).processSync(input);
    t.deepEqual(contents, '<h1>Hello!</h1>\n<pre><code class=\"language-css\">h1{}\n</code></pre>\n');
});

test('should not modify existing htmlAttributes and classes', t => {
    let ast = remark().parse('```css\n```');
    ast = remark()
        .use(() => tree => {
            tree.children[0].data = {
                hProperties: {
                    'data-foo': 'bar',
                    className: ['quux'],
                },
            };
        })
        .use(hljs)
        .runSync(ast);

    t.deepEqual(ast.children[0].data.hProperties['data-foo'], 'bar');
    t.deepEqual(ast.children[0].data.hProperties.className.indexOf('quux') >= 0, true);
});

test('should not throw on console syntax', t => {
    const input = '# Hello!\n\n```console\n$ webpack\n```';
    const {contents} = remark().use(html).use(hljs).processSync(input);
    t.deepEqual(contents, '<h1>Hello!</h1>\n<pre><code class=\"hljs language-console\"><span class=\"hljs-variable\">$ </span>webpack</code></pre>\n');
});
