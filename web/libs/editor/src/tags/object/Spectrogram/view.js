// Copyright (c) 2024 FHNW, licensed under MIT License
// Based on ../AudioNext/view_old.js
import { inject, observer } from 'mobx-react';
import { Fragment } from 'react';
import { ErrorMessage } from '../../../components/ErrorMessage/ErrorMessage';
import ObjectTag from '../../../components/Tags/Object';
import SpectrogramView from '../../../components/Spectrogram/SpectrogramView';
import AudioControls from '../Audio/Controls';
import { getEnv } from 'mobx-state-tree';

const HtxSpectrogramView = ({ store, item }) => {

  if (!item._value) return null;
  const messages = getEnv(store).messages;

  const addRectangles = (regions) => {
    item.addRectangles(regions);
  }

  const finishDrawing = (startX, startY, width, height) => {

    let control = null;
    let labels = null;
    let states = item.activeStates();

    if (states.length > 0) {
      control = states[states.length - 1];
      labels = {[control.valueType]: control.selectedValues()};
    }

    const region_props = {
      x: startX,
      y: startY,
      width: width,
      height: height,
      control: control,
      labels: labels,
    };

    return item.addRegion(region_props);

  }


  return (
    <ObjectTag item={item}>
      <Fragment>
        {item.errors?.map((error, i) => (
          <ErrorMessage key={`err-${i}`} error={error} />
        ))}
        <SpectrogramView
          dataField={item.value}
          src={item._value}
          muted={item.muted}
          item={item}
          finishDrawing={finishDrawing}
          setCanvas={item.setCanvas}
          setFreqMin={item.setFrequencyMin}
          setFreqMax={item.setFrequencyMax}
          setDuration={item.setDuration}
          selectRegion={item.selectRegion}
          handlePlay={item.handlePlay}
          handleSeek={item.handleSeek}
          onCreate={item.wsCreated}
          addRegion={item.addRegion}
          onLoad={item.onLoad}
          onReady={item.onReady}
          onError={item.onError}
          speed={item.speed}
          zoom={item.zoom}
          defaultVolume={Number(item.defaultvolume)}
          defaultSpeed={Number(item.defaultspeed)}
          defaultZoom={Number(item.defaultzoom)}
          volume={item.volume}
          regions={item.regions()}
          height={item.height}
          cursorColor={item.cursorcolor}
          cursorWidth={item.cursorwidth}
          messages={messages}
          addRectangles={addRectangles}
          getRectangles={item.getRectangles}
        />

        <AudioControls item={item} store={store} />
        <div style={{ marginBottom: '4px' }}></div>
      </Fragment>
    </ObjectTag>
  );
};

export const HtxSpectrogram = inject('store')(observer(HtxSpectrogramView));
