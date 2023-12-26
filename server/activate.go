package main

import "github.com/pkg/errors"

func (p *Plugin) OnActivate() error {
	p.API.LogDebug("Activating Embed Plguin")

	config := p.getConfiguration()
	err := config.IsValid()
	if err != nil {
		return errors.Wrap(err, "invalid config")
	}

	return nil
}

func (p *Plugin) OnDeactivate() error {
	p.API.LogDebug("Deactivating Embed Plguin")

	return nil
}
