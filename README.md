<img src="https://user-images.githubusercontent.com/12534576/192582340-4c9e4401-1fe6-4dbb-95bb-fdbba5493f61.png"/>


# MITWELTEN


Kontinuierliches Front-End Buildscript starten:

```bash
cd web
yarn lsf:watch
```

Erstelle Docker Container mit folder mounts (Windows): 
```bash
docker run -it -p 8080:8080 -v .\web\dist:/label-studio/web/dist -v .\label_studio\annotation_templates:/label-studio/label_studio/annotation_templates -v .\label_studio\core\static\templates:/label-studio/label_studio/core/static/templates heartexlabs/label-studio:latest
```
Erstelle Docker Container mit folder mounts (Linux/Mac):
```bash
docker run -it -p 8080:8080 -v ./web/dist:/label-studio/web/dist -v ./label_studio/annotation_templates:/label-studio/label_studio/annotation_templates -v ./label_studio/core/static/templates:/label-studio/label_studio/core/static/templates heartexlabs/label-studio:latest
```

Danach Docker Container starten und auf http://localhost:8080/ gehen.


## DIR Links

### Spectrogramm

[web/libs/editor/src/components/Spectrogram](web/libs/editor/src/components/Spectrogram)

- SpectrogramView.js

[web/libs/editor/src/tags/object/Spectrogram](web/libs/editor/src/tags/object/Spectrogram)

- Spectrogram/view.js
- Spectrogram/index.js
- Spectrogram/model.js

### Sonstige

[web/libs/editor/src/regions](web/libs/editor/src/regions)

- Versch. Regions


[web/editor/src/tags/CONTROL](web/libs/editor/src/tags/control)

- Rectangle
- RectangleLabels

[web/editor/src/tags/MIXINS](web/libs/editor/src/tags/mixins)

- KonvaRegion
- LabelMixin
- AnnotationMixin


[web/libs/editor/src/components/App](web/libs/editor/src/components/App)

- Annotation.js

[web/libs/editor/src/stores](web/libs/editor/src/stores)

- Versch. Stores
- Annotation.js
