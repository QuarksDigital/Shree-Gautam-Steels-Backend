import { Schema, model, type InferSchemaType } from 'mongoose';

const specSchema = new Schema(
  {
    material: { type: String, required: true },
    gauge: String,
    capacity: String,
    finish: String,
    dimensions: String,
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Cookware', 'Serveware', 'Storage', 'Thalis', 'Spice Boxes'],
      index: true,
    },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    specs: { type: specSchema, required: true },
    price: String,
    moq: { type: Number, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const ProductModel = model('Product', productSchema);
