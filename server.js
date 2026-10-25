import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/route.js';
import cors from 'cors';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

app.listen(port, () => {
  console.log(`TaskTodo app listening at http://localhost:${port}`);
});
