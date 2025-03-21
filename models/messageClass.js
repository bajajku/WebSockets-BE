class MessageClass {
  constructor(sender, content, timestamp = new Date().toISOString()) {
    this.sender = sender;
    this.content = content;
    this.timestamp = timestamp;
  }
}

module.exports = MessageClass; 