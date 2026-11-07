# Third-party notices

FLOW's local stem runtime uses the following open-source components:

- K.G.Studio local separator integration, © 2025-2026 Xiaohan Tian. See `KG-STUDIO-LICENSE.txt`. Required attribution: “Powered by K.G.Studio”.
- demucs-web 1.0.2 by timcsy, MIT License: https://github.com/timcsy/demucs-web
- ONNX Runtime Web by Microsoft, MIT License: https://github.com/microsoft/onnxruntime
- HTDemucs model architecture by Alexandre Défossez and contributors: https://github.com/facebookresearch/demucs
- web-audio-separation by incidentist, MIT License. See `WEB-AUDIO-SEPARATION-LICENSE.txt`.
- UVR MDX-Net karaoke model is downloaded on demand for low-latency two-stem vocal/instrumental separation.

FLOW's DJ audio runtime also uses:

- SoundTouchJS AudioWorklet, MPL-2.0. See `../vendor/SOUNDTOUCHJS-LICENSE.txt`.
- web-audio-beat-detector, MIT License. See `../vendor/WEB-AUDIO-BEAT-DETECTOR-LICENSE.txt`.

The model file is downloaded on demand from the configured Hugging Face repository and is not included in the extension archive.
