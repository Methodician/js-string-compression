import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const onWriteCompressed = functions.database.ref('compressed/{name}')
    .onWrite((change, context) => {
        if (!change.after.exists) {
            // do nothing if it was deleted or empty
            return null;
        }

        const newString = change.after.val();
        const naturalRef = change.after.ref.parent.parent.child('natural').child(context.params.name);
        return naturalRef.set(newString);
    });

const compressText = (text: string): string => {

    const maxIndex = text.length - 1;
    let matchLength = 15;
    let matchString = text.slice(0, matchLength);
    let index = 15;
    while (index !== -1 && matchLength > 5) {
        index = text.indexOf(matchString)
        if (index === -1) {
            index = index + 1;
        } else {
            text.replace(matchString, `<${index},${matchLength}>`);
            // Could skip a few indecies here based on the length of the encoded string
        }
        if (index >= maxIndex - matchLength) {
            matchLength--;
            index = matchLength;
        }
    }
    return text;

}

export const onWriteNatural = functions.database.ref('natural/{name}')
    .onWrite((change, context) => {
        if (!change.after.exists) {
            // do nothing if it was deleted or empty
            return null;
        }

        const oldString = change.after.val();
        const newString = compressText(oldString);
        const compressedRef = change.after.ref.parent.parent.child('compressed').child(context.params.name);
        return compressedRef.set(newString);
    });