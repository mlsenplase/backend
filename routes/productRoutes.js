import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  const { title, description, price } = req.body;

  let imageUrl = "";

  if (req.file) {
    const result = await cloudinary.uploader.upload_stream(
      { folder: "mstore" },
      (error, result) => {
        if (error) throw error;
        imageUrl = result.secure_url;
      }
    );

    const stream = result;
    stream.end(req.file.buffer);
  }

  const product = await Product.create({
    title,
    description,
    price,
    image: imageUrl
  });

  res.status(201).json(product);
});
