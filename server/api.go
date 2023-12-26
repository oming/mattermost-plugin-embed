package main

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/pkg/errors"
)

// ServeHTTP handles HTTP requests to the plugin.
func (p *Plugin) serveHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) (int, error) {
	mattermostUserID := r.Header.Get("Mattermost-User-Id")
	if mattermostUserID == "" {
		return respondErr(w, http.StatusUnauthorized, errors.New("not authorized"))
	}

	switch path := r.URL.Path; path {
	case "/api/v1/config":
		return p.handleRouteAPIConfig(w, r)
	}

	return respondErr(w, http.StatusNotFound, errors.New("not found"))
}

type EmbedConfigSite struct {
	SiteTitle string `json:"siteTitle"`
	SiteUrl   string `json:"siteUrl"`
}

type EmbedConfig struct {
	Products []EmbedConfigSite `json:"products"`
}

func (p *Plugin) handleRouteAPIConfig(w http.ResponseWriter, r *http.Request) (int, error) {
	p.API.LogDebug("handleRouteAPIConfig Call")

	if r.Method != http.MethodGet {
		return respondErr(w, http.StatusMethodNotAllowed,
			errors.Errorf("method %s is not allowed, must be GET", r.Method))
	}

	config := p.getConfiguration()

	err := config.IsValid()
	if err != nil {
		return respondErr(w, http.StatusNotImplemented, errors.New("This plugin is not configured"))
	}
	p.API.LogDebug("handleRouteAPIConfig", "config value", config)

	var products []EmbedConfigSite
	if len(config.ProductConfigs) != 0 {
		lines := strings.Split(config.ProductConfigs, "\n")
		p.API.LogDebug("handleRouteAPIConfig", "lines value", lines)
		for _, line := range lines {
			titleAndUrl := strings.Split(line, "|")
			p.API.LogDebug("handleRouteAPIConfig", "titleAndUrl value", titleAndUrl)
			if len(titleAndUrl) != 2 {
				p.API.LogError("Title And URL parsing Errorr", "titleAndUrl", titleAndUrl)
				return respondErr(w, http.StatusInternalServerError, errors.New("internal error"))
			}
			siteTitle := titleAndUrl[0]
			siteUrl := titleAndUrl[1]

			p.API.LogDebug("handleRouteAPIConfig", "siteTitle value", siteTitle, "siteUrl value", siteUrl)
			p.API.LogDebug("handleRouteAPIConfig", "siteTitle len value", len(siteTitle))

			if len(siteTitle) < 3 || len(siteTitle) > 10 {
				p.API.LogError("siteTitle Error, err=" + siteTitle)
				return respondErr(w, http.StatusInternalServerError, errors.New("internal error"))
			}

			_, err = url.Parse(siteUrl)
			if err != nil {
				p.API.LogError("siteUrl Error, err=" + err.Error())
				return respondErr(w, http.StatusInternalServerError, errors.New("internal error"))
			}
			product := EmbedConfigSite{
				SiteTitle: siteTitle,
				SiteUrl:   siteUrl,
			}

			products = append(products, product)
		}
	}

	var embedConfig EmbedConfig
	embedConfig.Products = products

	p.API.LogDebug("handleRouteAPIConfig", "embedConfig value", embedConfig)
	return respondJSON(w, embedConfig)
}

func respondErr(w http.ResponseWriter, code int, err error) (int, error) {
	http.Error(w, err.Error(), code)
	return code, err
}

func respondJSON(w http.ResponseWriter, obj interface{}) (int, error) {
	data, err := json.Marshal(obj)
	if err != nil {
		return respondErr(w, http.StatusInternalServerError, errors.WithMessage(err, "failed to marshal response"))
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(data)
	if err != nil {
		return http.StatusInternalServerError, errors.WithMessage(err, "failed to write response")
	}

	return http.StatusOK, nil
}
