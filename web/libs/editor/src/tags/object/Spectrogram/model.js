// Copyright (c) 2024 FHNW, licensed under MIT License
// Based on ../AudioNext/model.js
import {getRoot, getType, types} from 'mobx-state-tree';
import {AnnotationMixin} from '../../../mixins/AnnotationMixin';
import IsReadyMixin from '../../../mixins/IsReadyMixin';
import ProcessAttrsMixin from '../../../mixins/ProcessAttrs';
import {SyncableMixin} from '../../../mixins/Syncable';
import ObjectBase from '../Base';
/**
 * The Spectrogram tag plays Audio while simulatneously displaying the frequency spectrum of the audio.
 *
 * Use with the following data types: audio
 * @example
 * <!--Labeling configuration to label Regions of the spectrogram-image with rectangular labels-->
 * <View>
 *   <Labels name="labels" toName="spec">
 *     <Label value="Bat" />
 *     <Label value="Car" />
 *   </Labels>
 *   <Spectrogram name="spec" value="$audio" />
 * </View>
 * @meta_title Spectrogram Component for Audio Frequency Analysis
 * @meta_description Spectrogram Component for Visualizing and Analyzing Audio Frequencies
 * @param {string} name - Name of the element
 * @param {string} value - Data field containing path or a URL to the audio
 * @param {string} [defaultspeed=1] - Default speed level (from 0.5 to 2)
 * @param {string} [defaultzoom=1] - Default zoom level (from 1 to 1500)
 */
const Rectangle = types.model({
  x: types.number,
  y: types.number,
  width: types.number,
  height: types.number,
  color: types.string,
});

const TagAttrs = types.model({
  value: types.maybeNull(types.string),
  canvas: types.maybeNull(types.frozen()),
  frequencyMin: types.maybeNull(types.number),
  frequencyMax: types.maybeNull(types.number),
  duration: types.maybeNull(types.number),
});

export const SpectrogramModel = types.compose(
  'SpectrogramModel',
  TagAttrs,
  SyncableMixin,
  ProcessAttrsMixin,
  ObjectBase,
  AnnotationMixin,
  IsReadyMixin,
  types.model( {
    type: 'spectrogram',
    _value: types.optional(types.string, ''),
    rectangles: types.array(Rectangle)
  })
    .volatile(() => ({
      errors: [],
    }))
    .views(self => ({
      get hasStates() {
        const states = self.states();

        return states && states.length > 0;
      },

      get store() {
        return getRoot(self);
      },

      regions() {
        return self.annotation.areas;
      },

      states() {
        return self.annotation.toNames.get(self.name);
      },

      getRectangles() {
        return self.rectangles;
      },

      activeStates() {
        const states = self.states();

        return states && states.filter(s => getType(s).name === 'LabelsModel' && s.isSelected);
      },
    }))
    ////// Sync actions
    .actions(self => ({
      setCanvas(canvas) {
        self.canvas = canvas;
      },

      setFrequencyMin(min) {
        self.frequencyMin = min;
      },

      setFrequencyMax(max) {
        self.frequencyMax = max;
      },

      calculateFrequency(y) {
        return self.frequencyMax - (y / self.canvas.height) * self.frequencyMax - self.frequencyMin;
      },

      setDuration(duration) {
        self.duration = duration;
      },

      calculateTime(x){
        return (x / self.canvas.width) * self.duration;
      },

      calculateYFromFrequency(f) {
        return ((self.frequencyMax - f - self.frequencyMin) * self.canvas.height) / self.frequencyMax;
      },

      calculateXFromTime(t) {
        return (t * self.canvas.width) / self.duration;
      },

      calculateWidth(startTime, endTime) {
        const xStart = this.calculateXFromTime(startTime);
        const xEnd = this.calculateXFromTime(endTime);
        return xEnd - xStart;
      },

      calculateHeight(frequencyMin, frequencyMax) {
        const yMin = this.calculateYFromFrequency(frequencyMax);
        const yMax = this.calculateYFromFrequency(frequencyMin);
        return yMax - yMin;
      }

    }))
    .actions(self => ({

      addRegion(region_props) {
        const control = region_props.control;
        const labels = region_props.labels;

        if (!control) {
          console.error("NO CONTROL");
          return;
        }

        const areaValue = {
          x: region_props.x,
          y: region_props.y,
          width: region_props.width,
          height: region_props.height,
          start: self.calculateTime(region_props.x),
          end: self.calculateTime(region_props.x + region_props.width),
          frequencyMin: self.calculateFrequency(region_props.y +  region_props.height),
          frequencyMax: self.calculateFrequency(region_props.y)
        }

        self.annotation.createResult(areaValue, labels, control, self);
      },

      addRectangles(regions) {
        self.rectangles = [];
        regions.forEach((region) => {
          self.rectangles.push({
            x: self.calculateXFromTime(region.start),
            y: self.calculateYFromFrequency(region.frequencyMax),
            width: self.calculateWidth(region.start, region.end),
            height: self.calculateHeight(region.frequencyMin, region.frequencyMax),
            color: region.highlighted?"white":region.style.strokecolor,
          });
        });
      },
    })),
);
