
const express = require('express');
const { posts } = require('../data');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

const privilegedRoles = ['moderator', 'admin'];

function forbidden(res) {
  return res.status(403).json({
    error: {
      code: 'FORBIDDEN',
      message: 'You do not have permission to perform this action',
    },
  });
}

// Any authenticated user can view posts.
router.get('/', (req, res) => {
  return res.status(200).json(posts);
});

// Any authenticated user can create their own post.
router.post('/', (req, res) => {
  const post = {
    id: String(posts.length + 1),
    authorId: req.user.id,
    title: req.body?.title ?? 'Untitled',
    hidden: false,
  };

  posts.push(post);
  return res.status(201).json(post);
});

// Only the owner or a moderator/admin can edit a post.
router.patch('/:id', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Post not found' },
    });
  }

  const isOwner = post.authorId === req.user.id;
  const isPrivileged = privilegedRoles.includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    return forbidden(res);
  }

  post.title = req.body?.title ?? post.title;
  return res.status(200).json(post);
});

// Only the owner or a moderator/admin can delete a post.
router.delete('/:id', (req, res) => {
  const idx = posts.findIndex((p) => p.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Post not found' },
    });
  }

  const post = posts[idx];
  const isOwner = post.authorId === req.user.id;
  const isPrivileged = privilegedRoles.includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    return forbidden(res);
  }

  posts.splice(idx, 1);
  return res.status(200).json({ ok: true });
});

// Only moderators and admins can hide a post.
router.post(
  '/:id/hide',
  requireRole('moderator', 'admin'),
  (req, res) => {
    const post = posts.find((p) => p.id === req.params.id);

    if (!post) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Post not found' },
      });
    }

    post.hidden = true;
    return res.status(200).json(post);
  }
);

module.exports = router;
