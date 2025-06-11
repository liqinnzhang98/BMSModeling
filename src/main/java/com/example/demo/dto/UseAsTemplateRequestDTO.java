package com.example.demo.dto;

public class UseAsTemplateRequestDTO {
    private boolean useAsTemplate;
    private String templateName;

    public boolean isUseAsTemplate() {
        return useAsTemplate;
    }

    public void setUseAsTemplate(boolean useAsTemplate) {
        this.useAsTemplate = useAsTemplate;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }
}
