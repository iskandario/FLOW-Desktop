class FlowAnalyzerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.blockSize = 2048;
    this.left = new Float32Array(this.blockSize);
    this.right = new Float32Array(this.blockSize);
    this.offset = 0;
    this.active = true;
    this.port.onmessage = event => {
      if (event.data?.type === 'stop') this.active = false;
    };
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    for (const channel of output) channel.fill(0);
    if (!this.active || !input?.[0]) return this.active;

    const left = input[0];
    const right = input[1] || left;
    let sourceOffset = 0;
    while (sourceOffset < left.length) {
      const take = Math.min(left.length - sourceOffset, this.blockSize - this.offset);
      this.left.set(left.subarray(sourceOffset, sourceOffset + take), this.offset);
      this.right.set(right.subarray(sourceOffset, sourceOffset + take), this.offset);
      this.offset += take;
      sourceOffset += take;
      if (this.offset === this.blockSize) {
        const leftBlock = this.left;
        const rightBlock = this.right;
        this.port.postMessage({ type: 'audio', left: leftBlock, right: rightBlock }, [leftBlock.buffer, rightBlock.buffer]);
        this.left = new Float32Array(this.blockSize);
        this.right = new Float32Array(this.blockSize);
        this.offset = 0;
      }
    }
    return true;
  }
}

registerProcessor('flow-analyzer', FlowAnalyzerProcessor);
