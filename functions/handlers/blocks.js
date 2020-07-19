const { admin, db } = require('../util/admin');

const {
  validateBlockCreate,
  validateBlockUpdate,
} = require('../util/validators');

exports.blockCreate = (req, res) => {
  const newBlock = {
    task: req.body.task,
    description: req.body.description,
    durationWork: req.body.durationWork,
    durationBreak: req.body.durationBreak,
    numBursts: req.body.numBursts,
    userId: req.user.uid,
    stackId: req.body.stackId,
    createdAt: new Date().toISOString(),
  };

  // validate body data
  const { errors, valid } = validateBlockCreate(newBlock);
  if (!valid) {
    console.error("[ERROR] Invalid body params");

    return res.status(400).json(errors);
  }

  const stackDocument = db.doc(`/stacks/${req.body.stackId}`);
  var blockData

  stackDocument.get()
    .then(doc => {
      if (!doc.exists) {
        console.error("[ERROR] Stack not found");

        return res.status(404).json({ error: 'Stack not found' });
      }

      stackData =  doc.data();

      // verify that the user owns the document
      if (stackData.userId !== req.user.uid) {
        console.error('[ERROR] Unauthorized request');

        return res
          .status(403)
          .json({ error: 'Unauthorized access to document' });
      }

      // create the new block
      return db.collection('blocks').add(newBlock)
        .then((data) => {
          newBlock.blockId = data.id;
          stackData.order.push(data.id);

          return stackDocument.update({ order: stackData.order })
            .then(() => {
              return res.status(200).json(newBlock);
            })
            .catch(err => {
              console.error("[ERROR]", err);

              res.status(500).json({ error: err.code });
            })
        })
        .catch(err => {
          console.error("[ERROR]", err);

          res.status(500).json({ error: err.code });
        })
    })
    .catch(err => {
      console.error("[ERROR]", err);

      res.status(500).json({ error: err.code });
    })
}

exports.blockUpdate = (req, res) => {
  const update = {};
  if ("task" in req.body)
    update.task = req.body.task;
  if ("description" in req.body)
    update.description = req.body.description;
  if ("durationWork" in req.body)
    update.durationWork = req.body.durationWork;
  if ("durationBreak" in req.body)
    update.durationBreak = req.body.durationBreak;
  if ("numBursts" in req.body)
    update.numBursts = req.body.numBursts;

  const { errors, valid } = validateBlockUpdate(update);
  if (!valid) {
    console.error("[ERROR] Invalid body params");

    return res.status(400).json(errors);
  }

  const blockDocument = db.doc(`/blocks/${req.params.blockId}`);
  var blockData;

  blockDocument.get()
    .then(doc => {
      if (doc.exists) {
        blockData = doc.data();

        // verify that the user owns the document
        if (blockData.userId !== req.user.uid) {
          console.error('[ERROR] Unauthorized request');

          return res
            .status(403)
            .json({ error: 'Unauthorized access to document' });
        }

        blockData = {...blockData, ...update};

        return blockDocument.update(update)
          .then(() => {
            return res.status(200).json(blockData);
          })
      }
      else {
        console.error("[ERROR] Stack not found");

        return res.status(404).json({ error: 'Block not found' });
      }
    })

    .catch(err => {
      console.error("[ERROR]", err);

      res.status(500).json({ error: err.code });
    })
}

exports.blockDelete = (req, res) => {
  const blockDocument = db.doc(`/blocks/${req.params.blockId}`);
  var blockData;

  blockDocument.get()
    .then(doc => {
      if (doc.exists) {
        blockData = doc.data();

        // verify that the user owns the document
        if (blockData.userId !== req.user.uid) {
          console.error('[ERROR] Unauthorized request');

          return res
            .status(403)
            .json({ error: 'Unauthorized access to document' });
        }

        return blockDocument.delete()
          .then(() => {
            return res.status(200).json({ result: 'Deleted document' });
          })
      }
      else {
        console.error("[ERROR] Stack not found");

        return res.status(404).json({ error: 'Stack not found' });
      }
    })

    .catch(err => {
      console.error("[ERROR]", err);

      res.status(500).json({ error: err.code });
    })
}
