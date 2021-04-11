import React from 'react';
import { Grid, CircularProgress } from '@material-ui/core';

export default class LoadingCache extends React.Component {
  render() {
      return (
        <Grid container direction="row" style={{height:200}} justify="space-around" alignItems="center">
          <CircularProgress size={100} color="primary"/>
        </Grid>
      );
  }
}
