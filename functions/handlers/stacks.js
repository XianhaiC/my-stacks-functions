const { admin, db } = require('../util/admin');

const {
  validateStackCreate,
  validateStackUpdate,
  validateDocumentAccess,
  isNull,
} = require('../util/validators');

const {
  DEFAULT_IS_INBOX,
  DEFAULT_GRACE,
} = require('../util/constants');

exports.stackBlocksGet = async (req, res) => {
  const stackRequest = db.doc(`/stacks/${req.params.stackId}`);
  var blocksData = { blocks: {} };

  try {
    const stackDoc = await stackRequest.get();

    // validate access
    const { error, valid } = validateDocumentAccess(stackDoc, req.user.uid);
    if (!valid) {
      console.error('[ERROR]', error.message);
      return res.status(error.status).json(error.message);
    }

    // retrieve all blocks under the stack
    const blocksSnapshot = await db.collection('blocks')
      .where('stackId', '==', req.params.stackId)
      .get();

    blocksSnapshot.forEach((blockDoc) => {
      const blockData = blockDoc.data();
      blockData.id = blockDoc.id;
      blocksData.blocks[blockDoc.id] = blockData;
    });

    return res.status(200).json(blocksData);
  }
  catch (err) {
    console.error('[ERROR]', err);
    return res.status(500).json({ error: err.code });
  }
}

exports.stackBlocksDelete = async (req, res) => {
  const stackRequest = db.doc(`/stacks/${req.params.stackId}`);
  var blocksData = { blocks: {} };

  try {
    const stackDoc = await stackRequest.get();

    // validate access
    const { error, valid } = validateDocumentAccess(stackDoc, req.user.uid);
    if (!valid) {
      console.error('[ERROR]', error.message);
      return res.status(error.status).json(error.message);
    }

    // delete all blocks in a batch and clear the stack's order array
    const batchDelete = deleteBlocks(stackDoc);
    batchDelete.update(stackRequest, { order: [] });
    await batchDelete.commit();

    return res.status(200).json({ result: 'Deleted blocks' });
  }
  catch (err) {
    console.error('[ERROR]', err);
    return res.status(500).json({ error: err.code });
  }
}

exports.stackBlocksDeleteMultiple = async (req, res) => {
  const stackRequest = db.doc(`/stacks/${req.params.stackId}`);
  const blockIds = req.body;
  var blocksData = { blocks: {} };

  try {
    const stackDoc = await stackRequest.get();

    // validate access
    const { error, valid } = validateDocumentAccess(stackDoc, req.user.uid);
    if (!valid) {
      console.error('[ERROR]', error.message);
      return res.status(error.status).json(error.message);
    }

    // delete select blocks in a batch and clear those blocks from the stack's
    // order array
    const batchDelete = deleteBlocksMultiple(blockIds);
    const orderNew =
      stackDoc.data().order.filter(blockId => !blockIds.includes(blockId))
    batchDelete.update(stackRequest, { order: orderNew });
    await batchDelete.commit();

    return res.status(200).json({ result: 'Deleted blocks' });
  }
  catch (err) {
    console.error('[ERROR]', err);
    return res.status(500).json({ error: err.code });
  }
}

exports.stackCreate = (req, res) => {
  const newStack = {
    name: req.body.name,
    isRoutine: req.body.isRoutine,
    isInbox: DEFAULT_IS_INBOX,
    backgroundColor: req.body.backgroundColor,
    durationGrace: req.body.durationGrace,
    order: [],
    userId: req.user.uid,
    createdAt: new Date().toISOString(),
  };

  // validate body data
  const { errors, valid } = validateStackCreate(newStack);
  if (!valid) {
    console.error('[ERROR] Invalid body params');

    return res.status(400).json(errors);
  }

  db.collection('stacks').add(newStack)
    .then((data) => {
      const resStack = newStack;
      resStack.id = data.id;
      return res.status(200).json(resStack);
    })

    .catch(err => {
      console.error('[ERROR]', err);
      return res.status(500).json({ error: 'Something went wrong' });
    });
}

exports.stackUpdate = async (req, res) => {
  const update = {};
  if ('name' in req.body)
    update.name = req.body.name;
  if ('isRoutine' in req.body)
    update.isRoutine = req.body.isRoutine;
  if ('isInbox' in req.body)
    update.isInbox = req.body.isInbox;
  if ('backgroundColor' in req.body)
    update.backgroundColor = req.body.backgroundColor;
  if ('order' in req.body)
    update.order = req.body.order;
  if ('durationGrace' in req.body)
    update.durationGrace = req.body.durationGrace;

  const { errors, valid } = validateStackUpdate(update);
  if (!valid) {
    console.error('[ERROR] Invalid body params');
    return res.status(400).json(errors);
  }

  const stackRequest = db.doc(`/stacks/${req.params.stackId}`);
  var stackData;

  try {
    const stackDoc = await stackRequest.get();

    // validate access
    const { error, valid } = validateDocumentAccess(stackDoc, req.user.uid);
    if (!valid) {
      console.error('[ERROR]', error.message);
      return res.status(error.status).json(error.message);
    }

    stackData = { id: stackDoc.id, ...stackDoc.data(), ...update};

    await stackRequest.update(update)

    return res.status(200).json(stackData);
  }
  catch (err) {
    console.error('[ERROR]', err);
    return res.status(500).json({ error: err.code });
  }
}

exports.stackDelete = async (req, res) => {
  const stackRequest = db.doc(`/stacks/${req.params.stackId}`);

  try {
    const stackDoc = await stackRequest.get();

    // validate access
    const { error, valid } = validateDocumentAccess(stackDoc, req.user.uid);
    if (!valid) {
      console.error('[ERROR]', error.message);
      return res.status(error.status).json(error.message);
    }

    // delete stack and its blocks
    const batchDelete = deleteBlocks(stackDoc);
    batchDelete.delete(stackRequest);
    await batchDelete.commit();

    return res.status(200).json({ result: 'Deleted document' });
  }
  catch (err) {
    console.error('[ERROR]', err);
    return res.status(500).json({ error: err.code });
  }
}

const deleteBlocks = (stackDoc) => {
  const batchDelete = db.batch();

  // delete each block
  stackDoc.data().order.forEach((blockId) => {
    batchDelete.delete(db.doc(`/blocks/${blockId}`));
  });

  // return instead of committing since the caller may need
  // to append more writes
  return batchDelete;
}

const deleteBlocksMultiple = (blockIds) => {
  const batchDelete = db.batch();

  // delete each block
  blockIds.forEach((blockId) => {
    batchDelete.delete(db.doc(`/blocks/${blockId}`));
  });

  // return instead of committing since the caller may need
  // to append more writes
  return batchDelete;
}
