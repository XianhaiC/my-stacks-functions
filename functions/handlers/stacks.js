const { admin, db } = require('../util/admin');

const {
  validateStackCreate,
  validateStackUpdate,
  isNull,
} = require('../util/validators');

const {
  DEFAULT_IS_INBOX,
  DEFAULT_GRACE,
} = require('../util/constants');

exports.stackBlocksGet = (req, res) => {
  res.json("ok");
}

exports.stackBlocksDelete = (req, res) => {
  res.json("ok");
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
    console.error("[ERROR] Invalid body params");

    return res.status(400).json(errors);
  }

  db
    .collection('stacks')
    .add(newStack)

    .then((data) => {
      const resStack = newStack;
      resStack.stackId = data.id;
      res.json(resStack);
    })

    .catch(err => {
      console.error("[ERROR]", err);

      res.status(500).json({ error: 'Something went wrong' });
    });
}

exports.stackUpdate = (req, res) => {
  const update = {};
  if ("name" in req.body)
    update.name = req.body.name;
  if ("isRoutine" in req.body)
    update.isRoutine = req.body.isRoutine;
  if ("isInbox" in req.body)
    update.isInbox = req.body.isInbox;
  if ("backgroundColor" in req.body)
    update.backgroundColor = req.body.backgroundColor;
  if ("order" in req.body)
    update.order = req.body.order;
  if ("durationGrace" in req.body)
    update.durationGrace = req.body.durationGrace;

  const { errors, valid } = validateStackUpdate(update);
  if (!valid) {
    console.error("[ERROR] Invalid body params");

    return res.status(400).json(errors);
  }

  const stackDocument = db.doc(`/stacks/${req.params.stackId}`);
  var stackData;

  stackDocument.get()
    .then(doc => {
      if (doc.exists) {
        stackData = doc.data();

        // verify that the user owns the document
        if (stackData.userId !== req.user.uid) {
          console.error('[ERROR] Unauthorized request');

          return res
            .status(403)
            .json({ error: 'Unauthorized access to document' });
        }

        stackData = {...stackData, ...update};

        return stackDocument.update(update)
          .then(() => {
            return res.status(200).json(stackData);
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

exports.stackDelete = (req, res) => {
  const stackDocument = db.doc(`/stacks/${req.params.stackId}`);
  var stackData;

  stackDocument.get()
    .then(doc => {
      if (doc.exists) {
        stackData =  doc.data();

        // verify that the user owns the document
        if (stackData.userId !== req.user.uid) {
          console.error('[ERROR] Unauthorized request');

          return res
            .status(403)
            .json({ error: 'Unauthorized access to document' });
        }

        return stackDocument.delete()
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
