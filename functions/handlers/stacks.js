const { admin, db } = require('../util/admin');

const {
  validateStackCreate,
  validateStackUpdate,
  isNull,
} = require('../util/validators');

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
    backgroundColor: req.body.backgroundColor,
    userId: req.user.uid,
    order: [],
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
  const stackUpdate = {};
  if ("name" in req.body)
    stackUpdate.name = req.body.name;
  if ("isRoutine" in req.body)
    stackUpdate.isRoutine = req.body.isRoutine;
  if ("backgroundColor" in req.body)
    stackUpdate.backgroundColor = req.body.backgroundColor;
  if ("order" in req.body)
    stackUpdate.order = req.body.order;

  const { errors, valid } = validateStackUpdate(stackUpdate);
  if (!valid) {
    console.error("[ERROR] Invalid body params");

    return res.status(400).json(errors);
  }

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

        stackData = {...stackData, ...stackUpdate};

        return stackDocument.update(stackUpdate)
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
