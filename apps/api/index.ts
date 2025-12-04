import express from 'express';

const app = express();

app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).send('OK');
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
});

export default app;