export function getRmqUrl() {
  const user = process.env.RABBITMQ_USER;
  const pass = process.env.RABBITMQ_PASS;
  const host = process.env.RABBITMQ_HOST;
  const port = process.env.RABBITMQ_PORT;
  const vhost = process.env.RABBITMQ_VHOST;

  return `amqp://${user}:${pass}@${host}:${port}${vhost}`;
}
