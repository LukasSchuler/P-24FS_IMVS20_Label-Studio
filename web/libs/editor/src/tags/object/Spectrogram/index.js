// Copyright (c) 2024 FHNW, licensed under MIT License
// Based on ../AudioNext/index.js

import Registry from '../../../core/Registry';
import { SpectrogramModel } from './model';
import {HtxSpectrogram} from './view';



Registry.addTag('spectrogram', SpectrogramModel, HtxSpectrogram);
Registry.addObjectType(SpectrogramModel);

export {SpectrogramModel, HtxSpectrogram};
