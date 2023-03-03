import mongoose, { Schema } from 'mongoose';

// Define interface for user input
// interface DynamicField {
//   name: string;
//   value: string;
// }

// Define schema for MongoDB model
// interface MyModel extends Document {
//   name: string;
// //   [key: string]: string | undefined;
//   [key: string]: any;
// }

// const myModelSchema: Schema<MyModel> = new Schema({
//   name: { type: String, required: true },
//   [key]: {type: value}
// });

// const Test = mongoose.model<MyModel>('Test', myModelSchema);

// Create a new document and add a dynamic field based on user input
// const userInput: DynamicField = { name: 'newField', value: 'someValue' };
// const myDoc = new MyModel({ name: 'myDoc', [userInput.name]: userInput.value });

// // Save the document to MongoDB
// myDoc.save();

interface MyModel {
    name: string;
    dynamicField: Map<string, any>;
    // dynamicField: Record<string, any>;
}

const myModelSchema: Schema<MyModel> = new Schema({
    name: { type: String, required: true },
    dynamicField: { type: Map, of: Schema.Types.Mixed },
});

const Test = mongoose.model<MyModel>('Test', myModelSchema);

  // Create a new document with a dynamic field
  //   const myDoc = new MyModel({ name: 'myDoc', dynamicField: new Map([['foo', 'bar']]) });

export default Test
